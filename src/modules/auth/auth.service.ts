import { ConflictError } from "../../errors/AppError.js";
import { createUser, findUserByEmail } from "./auth.repository.js";
import { hashPassword } from "./password.js";

type RegisterUser = {
  userName: string;
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
