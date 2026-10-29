import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await createSession(user);

    const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

    return NextResponse.json({
      message: "Login successful.",
      redirectTo: redirectPath,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        studentId: user.studentId || null,
        role: user.role || "student",
      },
    });
  } catch (err) {
    console.error("[Login Error]", err);
    return NextResponse.json({ error: "Failed to log in." }, { status: 500 });
  }
}

