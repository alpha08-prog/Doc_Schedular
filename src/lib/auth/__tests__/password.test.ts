import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password";

describe("password hashing", () => {
  it("hashes a password to something other than the plaintext", async () => {
    const hash = await hashPassword("super-secret");
    expect(hash).not.toBe("super-secret");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("the-right-one");
    await expect(verifyPassword("the-wrong-one", hash)).resolves.toBe(false);
  });
});
