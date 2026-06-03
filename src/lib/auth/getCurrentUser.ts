import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionPayload, type SessionRole } from "./session";

// Server-side session access for Route Handlers and Server Components.
// (Next 14 `cookies()` is synchronous.) Does not touch Prisma — keep DB lookups
// in the caller when fresh user data is needed.

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** Returns the session, or null. Callers in route handlers turn null into 401. */
export async function requireUser(): Promise<SessionPayload | null> {
  return getSession();
}

/** Returns the session if it matches `role`, otherwise null (caller → 401/403). */
export async function requireRole(role: SessionRole): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== role) return null;
  return session;
}
