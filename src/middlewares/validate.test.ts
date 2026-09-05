import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";
import { validate } from "./validate.js";
import { registerSchema } from "../modules/auth/auth.schema.js";
import { ValidationError } from "../errors/AppError.js";

describe("validate", () => {
  it("should call next and sanitize req.body when data is valid", () => {
    const req = {
      body: {
        userName: "felipe",
        email: "felipe@teste.com",
        password: "senha1234",
      },
    } as unknown as Request;
    const res = {} as unknown as Response;
    const next = vi.fn();

    const middleware = validate(registerSchema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({
      userName: "felipe",
      email: "felipe@teste.com",
      password: "senha1234",
    });
  });

  it("should throw ValidationError when data is invalid", () => {
    const req = { body: { email: "not-an-email", password: "123" } } as unknown as Request;
    const res = {} as unknown as Response;
    const next = vi.fn();

    const middleware = validate(registerSchema);

    expect(() => middleware(req, res, next)).toThrow(ValidationError);
    expect(next).not.toHaveBeenCalled();
  });
});
