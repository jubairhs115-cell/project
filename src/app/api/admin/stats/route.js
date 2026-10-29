import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { isOverdue } from "@/lib/fines";

export async function GET() {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { db } = await connectToDatabase();

    // 1. Books
    const books = await (await db.collection("books").find({})).toArray();
    const totalBooks = books.length;
    const totalCopies = books.reduce((sum, b) => sum + (Number(b.totalCopies) || 0), 0);
    const availableBooks = books.reduce((sum, b) => sum + (Number(b.availableCopies) || 0), 0);

    // 2. Students
    const totalStudents = await db.collection("users").countDocuments({ role: "student" });

    // 3. Borrowings
    const borrowings = await (await db.collection("borrowings").find({})).toArray();
    let borrowedBooks = 0;
    let overdueBooks = 0;
    let unpaidFineTotal = 0;
    let collectedFineTotal = 0;

    for (const b of borrowings) {
      if (b.status === "borrowed") {
        borrowedBooks += 1;
        if (isOverdue(b.dueDate)) {
          overdueBooks += 1;
        }
      }

      if (b.fineStatus === "unpaid") {
        unpaidFineTotal += Number(b.fineAmount) || 0;
      } else if (b.fineStatus === "paid") {
        collectedFineTotal += Number(b.fineAmount) || 0;
      }
    }

    return NextResponse.json({
      totalBooks,
      totalCopies,
      availableBooks,
      borrowedBooks,
      totalStudents,
      overdueBooks,
      unpaidFineTotal,
      collectedFineTotal,
    });
  } catch (err) {
    console.error("[GET /api/admin/stats Error]", err);
    return NextResponse.json({ error: "Failed to fetch admin statistics." }, { status: 500 });
  }
}

