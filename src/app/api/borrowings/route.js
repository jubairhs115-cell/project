import { NextResponse } from "next/server";
import { connectToDatabase, ObjectId } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { calculateFine, calculateOverdueDays, isOverdue, isDueSoon } from "@/lib/fines";
import config from "@/config/config.json";

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export async function POST(request) {
  try {
    // Check 1: User is logged in and is a student
    const auth = await requireAuth(["student"]);
    if (auth.errorResponse) {
      return NextResponse.json(
        { error: "Please log in as a student." },
        { status: 403 }
      );
    }
    const student = auth.user;

    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const booksCollection = db.collection("books");
    const borrowingsCollection = db.collection("borrowings");

    const targetBookId = parseId(bookId);

    // Check 2: Book exists
    const book = await booksCollection.findOne({
      $or: [{ _id: bookId }, { _id: targetBookId }],
    });
    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    // Check 3: availableCopies is greater than 0
    if ((book.availableCopies || 0) <= 0) {
      return NextResponse.json(
        { error: "This book has no copies left." },
        { status: 400 }
      );
    }

    // Check 4: Student has no active borrowing of the same book
    const existingActiveLoan = await borrowingsCollection.findOne({
      userId: student._id,
      $or: [{ bookId: bookId }, { bookId: targetBookId }],
      status: "borrowed",
    });
    if (existingActiveLoan) {
      return NextResponse.json(
        { error: "You have already borrowed this book." },
        { status: 400 }
      );
    }

    // Check 5: Student's active borrowings are fewer than maxActiveBorrowsPerStudent
    const maxBorrows = config.borrowing.maxActiveBorrowsPerStudent || 3;
    const activeBorrowsCount = await borrowingsCollection.countDocuments({
      userId: student._id,
      status: "borrowed",
    });
    if (activeBorrowsCount >= maxBorrows) {
      return NextResponse.json(
        { error: `You have reached the borrow limit of ${maxBorrows} books.` },
        { status: 400 }
      );
    }

    // Check 6: If blockBorrowWhenUnpaidFine is true, student has no unpaid fine
    if (config.borrowing.blockBorrowWhenUnpaidFine) {
      const unpaidFinesCount = await borrowingsCollection.countDocuments({
        userId: student._id,
        fineStatus: "unpaid",
      });
      if (unpaidFinesCount > 0) {
        return NextResponse.json(
          { error: "Please clear your unpaid fine first." },
          { status: 400 }
        );
      }
    }

    // Atomic decrease of availableCopies (concurrency safety)
    const updateResult = await booksCollection.updateOne(
      {
        $or: [{ _id: bookId }, { _id: targetBookId }],
        availableCopies: { $gt: 0 },
      },
      {
        $inc: { availableCopies: -1 },
        $set: { updatedAt: new Date() },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "This book has no copies left." },
        { status: 400 }
      );
    }

    // Dates calculation
    const now = new Date();
    const loanDays = config.borrowing.loanDays || 14;
    const dueDate = new Date(now.getTime() + loanDays * 24 * 60 * 60 * 1000);

    const newBorrowing = {
      userId: student._id,
      studentName: student.name,
      studentId: student.studentId,
      bookId: book._id.toString(),
      bookTitle: book.title,
      borrowDate: now,
      dueDate,
      returnDate: null,
      status: "borrowed",
      fineAmount: 0,
      fineStatus: "none",
      createdAt: now,
    };

    const insertResult = await borrowingsCollection.insertOne(newBorrowing);
    newBorrowing._id = insertResult.insertedId;

    return NextResponse.json(
      { message: "Book borrowed successfully.", borrowing: newBorrowing },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/borrowings Error]", err);
    return NextResponse.json({ error: "Failed to borrow book." }, { status: 500 });
  }
}

