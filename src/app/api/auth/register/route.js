import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, studentId, password } = body;

    // 1. Validation
    if (!name?.trim() || !email?.trim() || !studentId?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, student ID, and password are all required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStudentId = studentId.trim().toUpperCase();

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // 2. Uniqueness checks
    const existingEmail = await usersCollection.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const existingStudentId = await usersCollection.findOne({ studentId: normalizedStudentId });
    if (existingStudentId) {
      return NextResponse.json(
        { error: "An account with this Student ID already exists." },
        { status: 409 }
      );
    }

    // 3. Create student user
    const hashedPassword = await hashPassword(password);
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      studentId: normalizedStudentId,
      password: hashedPassword,
      role: "student",
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    newUser._id = result.insertedId;

    // 4. Create session
    await createSession(newUser);

    return NextResponse.json(
      {
        message: "Registration successful.",
        user: {
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          studentId: newUser.studentId,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Register Error]", err);
    return NextResponse.json({ error: "Failed to register user." }, { status: 500 });
  }
}

