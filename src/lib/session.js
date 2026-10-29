import { NextResponse } from "next/server";
import { getSessionUser } from "./auth";

/**
 * Validates the current session and ensures the user possesses one of the allowed roles.
 * Returns { user } if valid, or { errorResponse } with 401 or 403 status.
 */
export async function requireAuth(allowedRoles = null) {
  const user = await getSessionUser();

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Please log in to continue." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(user.role)) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { error: `Forbidden. Action restricted to ${roles.join(", ")}.` },
          { status: 403 }
        ),
      };
    }
  }

  return { user, errorResponse: null };
}

