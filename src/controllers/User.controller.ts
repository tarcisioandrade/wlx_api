import { Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { AdType } from "../@types/Ad";
import { UserType } from "../@types/User";
import { IAdsRepo } from "../repository/adRepo";
import { ICategoryRepo } from "../repository/categoryRepo";
import { IStateRepo } from "../repository/stateRepo";
import { IUserRepo } from "../repository/userRepo";
import zodErrorFormatter from "../utils/ZodErrorFormatter";
import { userValidatorSchema } from "../validators/UserValidatorSchema";
import { BcryptType, ValidatorType } from "./Auth.controller";

class UserController {
  private userRepo: IUserRepo;
  private stateRepo: IStateRepo;
  private adRepo: IAdsRepo;
  private categoryRepo: ICategoryRepo;
  private bcrypt: BcryptType;
  private validator: ValidatorType;

  constructor(
    userRepo: IUserRepo,
    stateRepo: IStateRepo,
    adRepo: IAdsRepo,
    categoryRepo: ICategoryRepo,
    bcrypt: BcryptType,
    validator: ValidatorType,
  ) {
    this.userRepo = userRepo;
    this.stateRepo = stateRepo;
    this.adRepo = adRepo;
    this.categoryRepo = categoryRepo;
    this.bcrypt = bcrypt;
    this.validator = validator;

    this.getStates = this.getStates.bind(this);
    this.info = this.info.bind(this);
    this.editAction = this.editAction.bind(this);
  }

  async getStates(req: Request, res: Response) {
    const states = await this.stateRepo.getStates();

    res.status(200).json({ states });
  }

  async info(req: Request, res: Response) {
    const token = req.cookies.token;

    const user = await this.userRepo.getUserByToken(token);

    const state = await this.stateRepo.getStateByID(user!.state);
    const ads = await this.adRepo.getAdsByUserId(null, user!._id.toString());
    let adsList: AdType[] = [];

    for (let i in ads) {
      const categ = await this.categoryRepo.getCategoryById(ads[i].category);

      adsList.push({
        id: ads[i].id,
        idUser: ads[i].idUser,
        title: ads[i].title,
        category: categ!.slug,
        description: ads[i].description,
        price: ads[i].price,
        price_negotiable: ads[i].price_negotiable,
        images: ads[i].images,
        views: ads[i].views,
        state: ads[i].state,
        status: ads[i].status,
        created_at: ads[i].created_at,
      });
    }

    res.status(200).json({
      name: user?.name,
      email: user?.email,
      state: state?.name,
      ads: adsList,
    });
  }

  async editAction(req: Request, res: Response) {
    try {
      this.validator(req.body, userValidatorSchema);
      const token = req.cookies.token;

      let updates: Partial<UserType> = {};

      if (req.body.name) {
        updates.name = req.body.name;
      }

      if (req.body.email) {
        const emailCheck = await this.userRepo.getUserByEmail(req.body.email);
        if (emailCheck) {
          res.status(400).json({ error: "Email already in use." });
          return;
        }
        updates.email = req.body.email;
      }

      if (req.body.state) {
        if (mongoose.Types.ObjectId.isValid(req.body.state)) {
          const stateCheck = await this.stateRepo.getStateByID(req.body.state);
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
        updates.password = await this.bcrypt.hash(req.body.password, 10);
      }

      await this.userRepo.findUserAndUpdate(token, updates);

      res.sendStatus(200);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: zodErrorFormatter(error) });
      } else {
        console.log(error);
      }
    }
  }
}

export default UserController;
