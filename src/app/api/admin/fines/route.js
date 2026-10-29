import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { calculateFine, calculateOverdueDays, isOverdue } from "@/lib/fines";

export async function GET() {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { db } = await connectToDatabase();
    const cursor = await db.collection("borrowings").find({});
    const allBorrowings = await cursor.sort({ createdAt: -1 }).toArray();

    // Filter to only those with fines (past fineAmount > 0 OR currently active and overdue)
    const fineRecords = [];

    for (const b of allBorrowings) {
      const active = b.status === "borrowed";
      const liveOverdue = active && isOverdue(b.dueDate);
      const liveOverdueDays = active ? calculateOverdueDays(b.dueDate) : 0;
      const liveFine = active ? calculateFine(b.dueDate) : (b.fineAmount || 0);

      // Include if returned with fine, or has unpaid/paid/waived status, or currently accumulating fine
      if ((b.fineAmount && b.fineAmount > 0) || liveFine > 0 || (b.fineStatus && b.fineStatus !== "none")) {
        fineRecords.push({
          ...b,
          isOverdue: liveOverdue,
          overdueDays: liveOverdueDays,
          currentFine: liveFine,
          displayFineStatus: active && liveFine > 0 ? "accumulating" : b.fineStatus,
        });
      }
    }

    return NextResponse.json({ fines: fineRecords });
  } catch (err) {
    console.error("[GET /api/admin/fines Error]", err);
    return NextResponse.json({ error: "Failed to fetch fines." }, { status: 500 });
  }
}

