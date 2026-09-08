import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../../config/env.js";
import { ConflictError, UnauthorizedError } from "../../errors/AppError.js";
import {
  createUser,
  findUserByEmail,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
} from "./auth.repository.js";
import { hashPassword, comparePassword } from "./password.js";

type RegisterUser = {
  userName: string;
  email: string;
  password: string;
};

type LoginUser = {
  email: string;
  password: string;
};

async function generateAuthTokens(userId: string) {
  const accessToken = jwt.sign(
    {
      userId,
    },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshTokenValue = crypto.randomBytes(40).toString("hex");
  const refreshTokeExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createRefreshToken({
    userId,
    token: refreshTokenValue,
    expiresAt: refreshTokeExpiresAt,
  });

  return { accessToken, refreshToken: refreshTokenValue };
}

export async function registerUser(input: RegisterUser) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new ConflictError("Email already in use");
  }

  const newPassword = await hashPassword(input.password);
  const user = await createUser({
    userName: input.userName,
    email: input.email,
    passwordHash: newPassword,
  });

  return user;
}

export async function loginUser(input: LoginUser) {
  const user = await findUserByEmail(input.email);
  const isPasswordValid = user ? await comparePassword(input.password, user.passwordHash) : false;

  if (!user || !isPasswordValid) {
    throw new UnauthorizedError("Unauthorized");
  }

  return generateAuthTokens(user.id);
}

export async function refreshAccessToken(refreshTokenValue: string) {
  const storedToken = await findRefreshToken(refreshTokenValue);

  if (!storedToken) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token expired");
  }

  await deleteRefreshToken(refreshTokenValue);

  return generateAuthTokens(storedToken.userId);
}

export async function logoutUser(refreshTokenValue: string) {
  return deleteRefreshToken(refreshTokenValue);
}
