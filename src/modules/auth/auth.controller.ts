import type { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync.js";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "./auth.service.js";

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await registerUser(req.body);
  const { passwordHash: _passwordHash, ...safeUser } = user;

  res.status(201).json(safeUser);
  return;
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tokens = await loginUser(req.body);

  res.status(200).json(tokens);
});

export function me(req: Request, res: Response) {
  return res.status(200).json({
    userId: req.userId,
  });
}

export const refresh = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const token = req.body.refreshToken;
  const refreshedToken = await refreshAccessToken(token);

  res.status(200).json(refreshedToken);
});

export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const token = req.body.refreshToken;
  await logoutUser(token);

  res.status(204).send();
});
