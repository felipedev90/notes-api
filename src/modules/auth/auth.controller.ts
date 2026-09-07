import type { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync.js";
import { registerUser, loginUser } from "./auth.service.js";

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await registerUser(req.body);
  const { passwordHash: _passwordHash, ...safeUser } = user;

  res.status(201).json(safeUser);
  return;
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const authorizedUser = await loginUser(req.body);

  res.status(200).json({ token: authorizedUser });
});

export function me(req: Request, res: Response) {
  return res.status(200).json({
    userId: req.userId,
  });
}
