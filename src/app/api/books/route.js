import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import config from "@/config/config.json";

export async function GET(request) {
  try {
    const auth = await requireAuth();
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const available = searchParams.get("available")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || String(config.books.pageSize || 12), 10));

    const { db } = await connectToDatabase();
    const booksCollection = db.collection("books");

    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (available === "true") {
      filter.availableCopies = { $gt: 0 };
    }

    if (q) {
      filter.$text = { $search: q };
    }

    const totalBooks = await booksCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalBooks / limit) || 1;
    const skip = (page - 1) * limit;

    const cursor = await booksCollection.find(filter);
    const books = await cursor
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      books,
      pagination: {
        totalBooks,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error("[GET /api/books Error]", err);
    return NextResponse.json({ error: "Failed to fetch books." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { title, author, isbn, category, description, totalCopies } = body;

    // Validation
    if (!title?.trim() || !author?.trim() || !isbn?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: "Title, author, ISBN, and category are required." },
        { status: 400 }
      );
    }

    const parsedCopies = parseInt(totalCopies, 10);
    if (isNaN(parsedCopies) || parsedCopies < 1) {
      return NextResponse.json(
        { error: "Total copies must be an integer of 1 or greater." },
        { status: 400 }
      );
    }

    if (!config.books.categories.includes(category.trim())) {
      return NextResponse.json(
        { error: `Category must be one of: ${config.books.categories.join(", ")}` },
        { status: 400 }
      );
    }

    const normalizedIsbn = isbn.trim().toUpperCase();
    const { db } = await connectToDatabase();
    const booksCollection = db.collection("books");

    const existing = await booksCollection.findOne({ isbn: normalizedIsbn });
    if (existing) {
      return NextResponse.json(
        { error: "A book with this ISBN already exists." },
        { status: 409 }
      );
    }

    const newBook = {
      title: title.trim(),
      author: author.trim(),
      isbn: normalizedIsbn,
      category: category.trim(),
      description: description?.trim() || "",
      totalCopies: parsedCopies,
      availableCopies: parsedCopies,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await booksCollection.insertOne(newBook);
    newBook._id = result.insertedId;

    return NextResponse.json(
      { message: "Book created successfully.", book: newBook },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/books Error]", err);
    return NextResponse.json({ error: "Failed to create book." }, { status: 500 });
  }
}

