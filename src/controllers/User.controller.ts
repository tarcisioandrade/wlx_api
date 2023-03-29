import bcrypt from "bcrypt";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { Ad as AdType } from "../@types/Ad";
import { User as UserType } from "../@types/User";
import Ad from "../models/Ad";
import Category from "../models/Category";
import State from "../models/State";
import User from "../models/User";
import validator from "../utils/Validator";
import { userValidatorSchema } from "../validators/UserValidatorSchema";

export const getStates = async (req: Request, res: Response) => {
  const states = await State.find();
  res.json({ states });
};

export const info = async (req: Request, res: Response) => {
  const token = req.cookies.token;

  const user = await User.findOne({
    token,
  });

  const state = await State.findById(user?.state);
  const ads = await Ad.find({ id_user: user?._id });
  let adsList: AdType[] = [];

  for (let i in ads) {
    const categ = await Category.findById(ads[i].category);

    adsList.push({ ...ads[i], category: categ!.slug });
  }

  res.status(200).json({
    name: user?.name,
    email: user?.email,
    state: state?.name,
    ads: adsList,
  });
};

export const editAction = async (req: Request, res: Response) => {
  try {
    validator(req.body, userValidatorSchema);
    const token = req.cookies.token;

    let updates: Partial<UserType> = {};

    if (req.body.name) {
      updates.name = req.body.name;
    }

    if (req.body.email) {
      const emailCheck = await User.findOne({ email: req.body.email });
      if (emailCheck) {
        res.status(400).json({ error: "E-mail already exist." });
        return;
      }
      updates.email = req.body.email;
    }

    if (req.body.state) {
      if (mongoose.Types.ObjectId.isValid(req.body.state)) {
        const stateCheck = await State.findById(req.body.state);
        if (!stateCheck) {
          res.status(400).json({ error: "State not found." });
          return;
        }
        updates.state = req.body.state;
      } else {
        res.status(400).json({ error: "Invalid state." });
        return;
      }
    }

    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    await User.findOneAndUpdate({ token }, { $set: updates });

    res.status(200).end();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map((issue) => {
        return {
          path: issue.path[0],
          message: issue.message,
        };
      });

      res.status(400).json({ error: errorMessage });
    }
  }
};
