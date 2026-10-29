import { NextResponse } from "next/server";
import { connectToDatabase, ObjectId } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { calculateFine } from "@/lib/fines";

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const targetId = parseId(id);

    const { db } = await connectToDatabase();
    const borrowingsCollection = db.collection("borrowings");
    const booksCollection = db.collection("books");

    const borrowing = await borrowingsCollection.findOne({
      $or: [{ _id: id }, { _id: targetId }],
    });

    if (!borrowing) {
      return NextResponse.json({ error: "Borrowing record not found." }, { status: 404 });
    }

    // Role check: If student, must belong to them; admin can return on student's behalf
    if (auth.user.role === "student" && String(borrowing.userId) !== String(auth.user._id)) {
      return NextResponse.json(
        { error: "Forbidden. You can only return your own borrowed books." },
        { status: 403 }
      );
    }

    if (borrowing.status !== "borrowed") {
      return NextResponse.json(
        { error: "This book has already been returned." },
        { status: 400 }
      );
    }

    const returnDate = new Date();
    const finalFine = calculateFine(borrowing.dueDate, returnDate);
    const fineStatus = finalFine > 0 ? "unpaid" : "none";

    // 1. Update borrowing record
    await borrowingsCollection.updateOne(
      { $or: [{ _id: id }, { _id: targetId }] },
      {
        $set: {
          returnDate,
          status: "returned",
          fineAmount: finalFine,
          fineStatus,
          updatedAt: returnDate,
        },
      }
    );

    // 2. Increase availableCopies by 1
    const bookTargetId = parseId(borrowing.bookId);
    await booksCollection.updateOne(
      { $or: [{ _id: borrowing.bookId }, { _id: bookTargetId }] },
      {
        $inc: { availableCopies: 1 },
        $set: { updatedAt: new Date() },
      }
    );

    const updatedBorrowing = await borrowingsCollection.findOne({
      $or: [{ _id: id }, { _id: targetId }],
    });

    return NextResponse.json({
      message: "Book returned successfully.",
      borrowing: updatedBorrowing,
      fineAmount: finalFine,
      fineStatus,
    });
  } catch (err) {
    console.error("[PATCH /api/borrowings/[id]/return Error]", err);
    return NextResponse.json({ error: "Failed to return book." }, { status: 500 });
  }
}

