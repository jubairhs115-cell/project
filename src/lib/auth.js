import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase, ObjectId } from "./mongodb";

const JWT_SECRET = process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET || "iu-library-project-secret-key-2026";
const TOKEN_NAME = "iu_lib_session";

export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Creates an HTTP-only secure cookie containing the session JWT.
 */
export async function createSession(user) {
  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    studentId: user.studentId || null,
  });

  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return token;
}

/**
 * Destroys the current user session cookie.
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

/**
 * Retrieves the current session user by inspecting the session cookie.
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({
      $or: [
        { _id: payload.userId },
        { _id: new ObjectId(payload.userId) },
      ],
    });

    if (!user) return null;

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      studentId: user.studentId || null,
      role: user.role || "student",
      createdAt: user.createdAt,
    };
  } catch {
    return null;
  }
}

