import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { ZodError } from "zod";

import { IStateRepo } from "../repository/stateRepo";
import { IUserRepo } from "../repository/userRepo";
import validator from "../utils/Validator";
import zodErrorFormatter from "../utils/ZodErrorFormatter";
import {
  validatorSigninSchema,
  validatorSignupSchema,
} from "../validators/AuthValidatorsSchemas";

export type ValidatorType = typeof validator;
export type BcryptType = typeof bcrypt;

class AuthController {
  private userRepo: IUserRepo;
  private stateRepo: IStateRepo;
  private validator: ValidatorType;
  private bcrypt: BcryptType;

  constructor(
    userRepo: IUserRepo,
    stateRepo: IStateRepo,
    validator: ValidatorType,
    bcrypt: BcryptType,
  ) {
    this.userRepo = userRepo;
    this.stateRepo = stateRepo;
    this.validator = validator;
    this.bcrypt = bcrypt;

    this.signin = this.signin.bind(this);
    this.signup = this.signup.bind(this);
  }

  // SIGNIN
  async signin(req: Request, res: Response) {
    try {
      this.validator(req.body, validatorSigninSchema);

      const user = await this.userRepo.getUserByEmail(req.body.email);

      if (!user) {
        res.status(401).json({ error: "E-mail or password incorrect." });
        return;
      }
      const match = await this.bcrypt.compare(req.body.password, user.password);

      if (!match) {
        res.status(404).json({ error: "E-mail or password incorrect." });
        return;
      }

      const payload = (Date.now() + Math.random()).toString();
      const token = await bcrypt.hash(payload, 10);

      user.token = token;
      user.save();

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 3600000,
      });

      return res.status(200).json({ email: req.body.email, token: user.token });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: zodErrorFormatter(error) });
      } else {
        console.log(error);
      }
    }
  }

  // SIGNUP
  async signup(req: Request, res: Response) {
    try {
      validator(req.body, validatorSignupSchema);

      const user = await this.userRepo.getUserByEmail(req.body.email);

      if (user) {
        res.status(409).json({ error: "E-mail already registered." });
        return;
      }

      const state = await this.stateRepo.getStateByID(req.body.state);
      if (!state) {
        res.status(404).json({ error: "State not found." });
        return;
      }

      const passwordHash = await this.bcrypt.hash(req.body.password, 10);
      const payload = (Date.now() + Math.random()).toString();
      const token = await this.bcrypt.hash(payload, 10);

      const newUser = await this.userRepo.createNewUser({
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
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 3600000,
      });

      res.sendStatus(200);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: zodErrorFormatter(error) });
      } else {
        console.log(error);
      }
    }
  }

  authentication(req: Request, res: Response) {
    res.status(200).json({ authenticate: true });
  }

  signout(req: Request, res: Response) {
    res.clearCookie("token");
    res.sendStatus(200);
  }
}

export default AuthController;
