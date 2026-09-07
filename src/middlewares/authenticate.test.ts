import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "./authenticate.js";
import { UnauthorizedError } from "../errors/AppError.js";

vi.mock("jsonwebtoken");

describe("authenticate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw UnauthorizedError when there is no Authorization header", () => {
    const req = { headers: {} } as unknown as Request;
    const res = {} as unknown as Response;
    const next = vi.fn();

    expect(() => authenticate(req, res, next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw UnauthorizedError when header has no token after 'Bearer'", () => {
    const req = { headers: { authorization: "Bearer" } } as unknown as Request;
    const res = {} as unknown as Response;
    const next = vi.fn();

    expect(() => authenticate(req, res, next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw UnauthorizedError when jwt.verify fails", () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error("invalid token");
    });

    const req = { headers: { authorization: "Bearer some-invalid-token" } } as unknown as Request;
    const res = {} as unknown as Response;
    const next = vi.fn();

    expect(() => authenticate(req, res, next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("should populate req.userId and call next when token is valid", () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: "user-123" } as never);

    const req = {
      headers: { authorization: "Bearer valid-token" },
    } as unknown as Request;
    const res = {} as unknown as Response;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(req.userId).toBe("user-123");
    expect(next).toHaveBeenCalledOnce();
  });
});
