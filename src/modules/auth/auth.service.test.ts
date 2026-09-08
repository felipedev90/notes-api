import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser, loginUser } from "./auth.service.js";
import { createUser, findUserByEmail, createRefreshToken } from "./auth.repository.js";
import { hashPassword, comparePassword } from "./password.js";
import { ConflictError, UnauthorizedError } from "../../errors/AppError.js";
import jwt from "jsonwebtoken";

vi.mock("./auth.repository.js");
vi.mock("./password.js");
vi.mock("jsonwebtoken");

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw ConflictError when email already exists", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      id: "1",
      userName: "felipe",
      email: "felipe@teste.com",
      passwordHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      registerUser({ userName: "felipe", email: "felipe@teste.com", password: "senha1234" })
    ).rejects.toThrow(ConflictError);

    expect(createUser).not.toHaveBeenCalled();
  });

  it("should hash the password and create the user when email is new", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null);
    vi.mocked(hashPassword).mockResolvedValue("hashed-password");
    vi.mocked(createUser).mockResolvedValue({
      id: "1",
      userName: "felipe",
      email: "felipe@teste.com",
      passwordHash: "hashed-password",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await registerUser({
      userName: "felipe",
      email: "felipe@teste.com",
      password: "senha1234",
    });

    expect(hashPassword).toHaveBeenCalledWith("senha1234");
    expect(createUser).toHaveBeenCalledWith({
      userName: "felipe",
      email: "felipe@teste.com",
      passwordHash: "hashed-password",
    });
    expect(user.email).toBe("felipe@teste.com");
  });
});

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw UnauthorizedError when user does not exist", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null);

    await expect(
      loginUser({ email: "naoexiste@teste.com", password: "senha1234" })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError when password does not match", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      id: "1",
      userName: "felipe",
      email: "felipe@teste.com",
      passwordHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(comparePassword).mockResolvedValue(false);

    await expect(loginUser({ email: "felipe@teste.com", password: "senhaerrada" })).rejects.toThrow(
      UnauthorizedError
    );
  });

  it("should return access and refresh tokens when credentials are valid", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      id: "1",
      userName: "felipe",
      email: "felipe@teste.com",
      passwordHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(comparePassword).mockResolvedValue(true);
    vi.mocked(jwt.sign).mockReturnValue("fake-access-token" as never);
    vi.mocked(createRefreshToken).mockResolvedValue({
      id: "rt-1",
      userId: "1",
      token: "fake-refresh-token",
      expiresAt: new Date(),
      createdAt: new Date(),
    });

    const tokens = await loginUser({ email: "felipe@teste.com", password: "senha1234" });

    expect(tokens.accessToken).toBe("fake-access-token");
    expect(typeof tokens.refreshToken).toBe("string");
    expect(createRefreshToken).toHaveBeenCalledWith({
      userId: "1",
      token: tokens.refreshToken,
      expiresAt: expect.any(Date),
    });
  });
});
