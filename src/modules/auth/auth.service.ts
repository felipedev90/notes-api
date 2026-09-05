import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ConflictError, UnauthorizedError } from "../../errors/AppError.js";
import { createUser, findUserByEmail } from "./auth.repository.js";
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

  const authorizedToken = jwt.sign(
    {
      userId: user.id,
    },
    env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return authorizedToken;
}
