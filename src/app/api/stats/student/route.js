import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { calculateFine, isOverdue, isDueSoon } from "@/lib/fines";

export async function GET() {
  try {
    const auth = await requireAuth(["student"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { db } = await connectToDatabase();
    const cursor = await db.collection("borrowings").find({ userId: auth.user._id });
    const borrowings = await cursor.toArray();

    let borrowedNow = 0;
    let dueSoon = 0;
    let overdue = 0;
    let unpaidFineTotal = 0;

    for (const b of borrowings) {
      if (b.status === "borrowed") {
        borrowedNow += 1;
        if (isOverdue(b.dueDate)) {
          overdue += 1;
          // Add live accumulating fine
          unpaidFineTotal += calculateFine(b.dueDate);
        } else if (isDueSoon(b.dueDate)) {
          dueSoon += 1;
        }
      }

      if (b.status === "returned" && b.fineStatus === "unpaid") {
        unpaidFineTotal += Number(b.fineAmount) || 0;
      }
    }

    return NextResponse.json({
      borrowedNow,
      dueSoon,
      overdue,
      unpaidFineTotal,
    });
  } catch (err) {
    console.error("[GET /api/stats/student Error]", err);
    return NextResponse.json({ error: "Failed to fetch student statistics." }, { status: 500 });
  }
}

