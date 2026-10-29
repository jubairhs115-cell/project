import { NextResponse } from "next/server";
import { connectToDatabase, ObjectId } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import config from "@/config/config.json";

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const targetId = parseId(id);

    const { db } = await connectToDatabase();
    const book = await db.collection("books").findOne({
      $or: [{ _id: id }, { _id: targetId }],
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    let isAlreadyBorrowedByMe = false;
    if (auth.user.role === "student") {
      const activeBorrow = await db.collection("borrowings").findOne({
        userId: auth.user._id,
        $or: [{ bookId: id }, { bookId: targetId }],
        status: "borrowed",
      });
      isAlreadyBorrowedByMe = !!activeBorrow;
    }

    return NextResponse.json({
      book,
      isAlreadyBorrowedByMe,
    });
  } catch (err) {
    console.error("[GET /api/books/[id] Error]", err);
    return NextResponse.json({ error: "Failed to fetch book." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const targetId = parseId(id);
    const body = await request.json();
    const { title, author, isbn, category, description, totalCopies } = body;

    const { db } = await connectToDatabase();
    const booksCollection = db.collection("books");

    const existing = await booksCollection.findOne({
      $or: [{ _id: id }, { _id: targetId }],
    });

    if (!existing) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    const updates = {};
    if (title?.trim()) updates.title = title.trim();
    if (author?.trim()) updates.author = author.trim();
    if (description !== undefined) updates.description = description.trim();

    if (category?.trim()) {
      if (!config.books.categories.includes(category.trim())) {
        return NextResponse.json(
          { error: `Category must be one of: ${config.books.categories.join(", ")}` },
          { status: 400 }
        );
      }
      updates.category = category.trim();
    }

    if (isbn?.trim()) {
      const normIsbn = isbn.trim().toUpperCase();
      if (normIsbn !== existing.isbn) {
        const dup = await booksCollection.findOne({ isbn: normIsbn });
        if (dup) {
          return NextResponse.json(
            { error: "A book with this ISBN already exists." },
            { status: 409 }
          );
        }
        updates.isbn = normIsbn;
      }
    }

    if (totalCopies !== undefined) {
      const parsedCopies = parseInt(totalCopies, 10);
      if (isNaN(parsedCopies) || parsedCopies < 1) {
        return NextResponse.json(
          { error: "Total copies must be 1 or greater." },
          { status: 400 }
        );
      }
      const borrowedCount = (existing.totalCopies || 0) - (existing.availableCopies || 0);
      if (parsedCopies < borrowedCount) {
        return NextResponse.json(
          { error: `Cannot reduce total copies below currently borrowed count (${borrowedCount}).` },
          { status: 400 }
        );
      }
      updates.totalCopies = parsedCopies;
      updates.availableCopies = parsedCopies - borrowedCount;
    }

    updates.updatedAt = new Date();

    await booksCollection.updateOne(
      { $or: [{ _id: id }, { _id: targetId }] },
      { $set: updates }
    );

    const updatedBook = await booksCollection.findOne({
      $or: [{ _id: id }, { _id: targetId }],
    });

    return NextResponse.json({
      message: "Book updated successfully.",
      book: updatedBook,
    });
  } catch (err) {
    console.error("[PUT /api/books/[id] Error]", err);
    return NextResponse.json({ error: "Failed to update book." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const targetId = parseId(id);

    const { db } = await connectToDatabase();

    // Check for active borrowings (PRD Section 7.4 / ADM-4)
    const activeBorrow = await db.collection("borrowings").findOne({
      $or: [{ bookId: id }, { bookId: targetId }],
      status: "borrowed",
    });

    if (activeBorrow) {
      return NextResponse.json(
        { error: "Cannot delete this book because it has active borrowings." },
        { status: 400 }
      );
    }

    const result = await db.collection("books").deleteOne({
      $or: [{ _id: id }, { _id: targetId }],
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Book deleted successfully." });
  } catch (err) {
    console.error("[DELETE /api/books/[id] Error]", err);
    return NextResponse.json({ error: "Failed to delete book." }, { status: 500 });
  }
}

