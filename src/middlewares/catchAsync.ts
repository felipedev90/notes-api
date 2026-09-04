import type { Request, Response, NextFunction } from "express";

export const catchAsync = <P = Record<string, string>>(
  fn: (req: Request<P>, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request<P>, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
