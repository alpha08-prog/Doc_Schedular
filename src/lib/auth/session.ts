import { SignJWT, jwtVerify } from "jose";

// Edge-safe session layer. Uses `jose` (Web Crypto) so it works in BOTH the
// Edge middleware and Node route handlers. MUST NOT import Prisma, bcrypt, or
// any Node-only API.

export const SESSION_COOKIE = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

export type SessionRole = "patient" | "doctor";

export interface SessionPayload {
  sub: string; // User id
  email: string;
  name: string;
  role: SessionRole;
  // For doctors: the linked catalog Doctor.id (appointments/prescriptions key
  // off this, not the User id). Undefined for patients.
  doctorProfileId?: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET is missing or shorter than 32 characters. Set it in .env.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const { sub, email, name, role, doctorProfileId } = payload;
  return new SignJWT({ email, name, role, doctorProfileId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role;
    if (role !== "patient" && role !== "doctor") return null;
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : "",
      role,
      doctorProfileId:
        typeof payload.doctorProfileId === "string" ? payload.doctorProfileId : undefined,
    };
  } catch {
    // Expired, tampered, or malformed token.
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
