import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";

export async function GET() {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { db } = await connectToDatabase();
    const studentsCursor = await db.collection("users").find({ role: "student" });
    const students = await studentsCursor.sort({ createdAt: -1 }).toArray();

    const borrowingsCursor = await db.collection("borrowings").find({});
    const allBorrowings = await borrowingsCursor.toArray();

    const studentsWithMetrics = students.map((stu) => {
      const studentBorrows = allBorrowings.filter((b) => String(b.userId) === String(stu._id));
      const activeBorrows = studentBorrows.filter((b) => b.status === "borrowed").length;
      const unpaidFines = studentBorrows
        .filter((b) => b.fineStatus === "unpaid")
        .reduce((sum, b) => sum + (Number(b.fineAmount) || 0), 0);

      return {
        _id: stu._id.toString(),
        name: stu.name,
        email: stu.email,
        studentId: stu.studentId,
        createdAt: stu.createdAt,
        activeBorrows,
        unpaidFines,
      };
    });

    return NextResponse.json({ students: studentsWithMetrics });
  } catch (err) {
    console.error("[GET /api/admin/students Error]", err);
    return NextResponse.json({ error: "Failed to fetch students." }, { status: 500 });
  }
}

