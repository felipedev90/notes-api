import { prisma } from "../../lib/prisma.js";

type CreateUserInput = {
  userName: string;
  email: string;
  passwordHash: string;
};

type CreateRefreshToken = {
  userId: string;
  token: string;
  expiresAt: Date;
};

export async function createUser(input: CreateUserInput) {
  return prisma.user.create({
    data: input,
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createRefreshToken(token: CreateRefreshToken) {
  return prisma.refreshToken.create({
    data: token,
  });
}

export async function findRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({
    where: { token },
  });
}

export async function deleteRefreshToken(token: string) {
  return prisma.refreshToken.delete({
    where: { token },
  });
}
