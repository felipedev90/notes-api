import { prisma } from "../../lib/prisma.js";

type CreateUserInput = {
  userName: string;
  email: string;
  passwordHash: string;
};

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(input: CreateUserInput) {
  return prisma.user.create({
    data: input,
  });
}
