import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { ZodError } from "zod";

import State from "../models/State";
import User from "../models/User";
import validator from "../utils/Validator";
import {
  validatorSigninSchema,
  validatorSignupSchema,
} from "../validators/AuthValidatorsSchemas";

export const signup = async (req: Request, res: Response) => {
  try {
    validator(req.body, validatorSignupSchema);

    const user = await User.findOne({
      email: req.body.email,
    });

    if (user) {
      res.status(400).json({ error: "E-mail already exist." });
      return;
    }

    const state = await State.findById(req.body.state);
    if (!state) {
      res.status(404).json({ error: "State not found." });
      return;
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const payload = (Date.now() + Math.random()).toString();
    const token = await bcrypt.hash(payload, 10);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: passwordHash,
      state: req.body.state,
      token,
    });
    await newUser.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
    });

    res.sendStatus(200);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues });
    }
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    validator(req.body, validatorSigninSchema);

    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      res.status(401).json({ error: "E-mail or password incorrect." });
      return;
    }
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      res.status(401).json({ error: "E-mail or password incorrect." });
      return;
    }

    const payload = (Date.now() + Math.random()).toString();
    const token = await bcrypt.hash(payload, 10);

    user.token = token;
    user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(200).json({ email: req.body.email, token });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues });
    }
  }
};

export const authentication = async (req: Request, res: Response) => {
  res.status(200).json({ authenticate: true });
};

export const signout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.sendStatus(200);
};
