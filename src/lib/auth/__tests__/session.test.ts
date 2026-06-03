// @vitest-environment node
import { describe, it, expect } from "vitest";
import { signSession, verifySession } from "../session";

const payload = {
  sub: "user-123",
  email: "user@example.com",
  name: "Test User",
  role: "patient" as const,
};

describe("session JWT", () => {
  it("signs and verifies a valid session", async () => {
    const token = await signSession(payload);
    const result = await verifySession(token);
    expect(result).not.toBeNull();
    expect(result?.sub).toBe("user-123");
    expect(result?.role).toBe("patient");
    expect(result?.email).toBe("user@example.com");
  });

  it("carries doctorProfileId for doctors", async () => {
    const token = await signSession({ ...payload, role: "doctor", doctorProfileId: "1" });
    const result = await verifySession(token);
    expect(result?.role).toBe("doctor");
    expect(result?.doctorProfileId).toBe("1");
  });

  it("returns null for a tampered token", async () => {
    const token = await signSession(payload);
    const tampered = token.slice(0, -3) + "xyz";
    expect(await verifySession(tampered)).toBeNull();
  });

  it("returns null for empty/undefined input", async () => {
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession("")).toBeNull();
    expect(await verifySession("not-a-jwt")).toBeNull();
  });
});
