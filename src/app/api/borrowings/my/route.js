import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { calculateFine, calculateOverdueDays, isOverdue, isDueSoon } from "@/lib/fines";

export async function GET(request) {
  try {
    const auth = await requireAuth(["student"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "borrowed", "returned", or null for all

    const { db } = await connectToDatabase();
    const query = { userId: auth.user._id };

    if (status && (status === "borrowed" || status === "returned")) {
      query.status = status;
    }

    const cursor = await db.collection("borrowings").find(query);
    const borrowings = await cursor.sort({ createdAt: -1 }).toArray();

    // Augment with real-time computed overdue & fine status
    const augmented = borrowings.map((b) => {
      const active = b.status === "borrowed";
      const liveOverdue = active && isOverdue(b.dueDate);
      const liveOverdueDays = active ? calculateOverdueDays(b.dueDate) : 0;
      const liveFine = active ? calculateFine(b.dueDate) : (b.fineAmount || 0);
      const dueSoon = active && isDueSoon(b.dueDate);

      return {
        ...b,
        isOverdue: liveOverdue,
        overdueDays: liveOverdueDays,
        liveFine,
        isDueSoon: dueSoon,
      };
    });

    return NextResponse.json({ borrowings: augmented });
  } catch (err) {
    console.error("[GET /api/borrowings/my Error]", err);
    return NextResponse.json({ error: "Failed to fetch borrowings." }, { status: 500 });
  }
}

