import { NextResponse } from "next/server";
import { connectToDatabase, ObjectId } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { borrowingId } = await params;
    const targetId = parseId(borrowingId);
    const body = await request.json();
    const { fineStatus } = body;

    if (!["paid", "waived"].includes(fineStatus)) {
      return NextResponse.json(
        { error: "fineStatus must be either 'paid' or 'waived'." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const borrowingsCollection = db.collection("borrowings");

    const borrowing = await borrowingsCollection.findOne({
      $or: [{ _id: borrowingId }, { _id: targetId }],
    });

    if (!borrowing) {
      return NextResponse.json({ error: "Borrowing record not found." }, { status: 404 });
    }

    await borrowingsCollection.updateOne(
      { $or: [{ _id: borrowingId }, { _id: targetId }] },
      {
        $set: {
          fineStatus,
          fineResolvedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: `Fine marked as ${fineStatus}.`,
      borrowingId,
      fineStatus,
    });
  } catch (err) {
    console.error("[PATCH /api/admin/fines/[borrowingId] Error]", err);
    return NextResponse.json({ error: "Failed to update fine." }, { status: 500 });
  }
}

