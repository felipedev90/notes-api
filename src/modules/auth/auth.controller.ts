import type { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync.js";
import { registerUser } from "./auth.service.js";

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await registerUser(req.body);
  const { passwordHash: _passwordHash, ...safeUser } = user;

  res.status(201).json(safeUser);
  return;
});
