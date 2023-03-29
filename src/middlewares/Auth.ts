import { NextFunction, Request, Response } from "express";

import User from "../models/User";

export const routePrivate = async ( req: Request, res: Response, next: NextFunction ) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ notallowed: true });
    return;
  }

  const user = await User.findOne({
    token,
  });

  if (user) {
    next();
    return;
  }

  res.status(401).json({ notallowed: true });
};
