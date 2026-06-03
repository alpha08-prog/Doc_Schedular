import "@testing-library/jest-dom/vitest";

// A deterministic secret so the jose-based session helpers work under test.
process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
