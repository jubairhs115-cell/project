import { NextResponse } from "next/server";
import { connectToDatabase, ObjectId } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { calculateFine, calculateOverdueDays, isOverdue } from "@/lib/fines";

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const targetId = parseId(id);

    const { db } = await connectToDatabase();
    const student = await db.collection("users").findOne({
      $or: [{ _id: id }, { _id: targetId }],
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const cursor = await db.collection("borrowings").find({
      $or: [{ userId: id }, { userId: targetId }],
    });
    const borrowings = await cursor.sort({ createdAt: -1 }).toArray();

    const augmented = borrowings.map((b) => {
      const active = b.status === "borrowed";
      return {
        ...b,
        isOverdue: active && isOverdue(b.dueDate),
        overdueDays: active ? calculateOverdueDays(b.dueDate) : 0,
        liveFine: active ? calculateFine(b.dueDate) : (b.fineAmount || 0),
      };
    });

    return NextResponse.json({
      student: {
        _id: student._id.toString(),
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        role: student.role,
        createdAt: student.createdAt,
      },
      borrowings: augmented,
    });
  } catch (err) {
    console.error("[GET /api/admin/students/[id] Error]", err);
    return NextResponse.json({ error: "Failed to fetch student details." }, { status: 500 });
  }
}

