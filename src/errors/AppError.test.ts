import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from "./AppError.js";

describe("AppError subclasses", () => {
  it("ValidationError should have statusCode 403", () => {
    const error = new ValidationError("Invalid input data");

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid input data");
  });

  it("UnauthorizedError should have statusCode 401", () => {
    const error = new UnauthorizedError("Unauthorized");

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized");
  });

  it("ForbiddenError should have statusCode 403", () => {
    const error = new ForbiddenError("Forbidden");

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Forbidden");
  });

  it("NotFoundError should have statusCode 404", () => {
    const error = new NotFoundError("Resource not found");

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Resource not found");
  });

  it("ConflictError should have statusCode 409", () => {
    const error = new ConflictError("Email already in use");

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Email already in use");
  });

  it("should be an instance of AppError and Error", () => {
    const error = new NotFoundError("Resource not found");

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });
});
