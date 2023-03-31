import bcrypt from "bcrypt";

import UserController from "../controllers/User.controller";
import { AdRepo } from "../repository/adRepo";
import { CategoryRepo } from "../repository/categoryRepo";
import { StateRepo } from "../repository/stateRepo";
import { UserRepo } from "../repository/userRepo";
import validator from "../utils/Validator";

const userRepo = new UserRepo();
const stateRepo = new StateRepo();
const adRepo = new AdRepo();
const categoryRepo = new CategoryRepo();

const userController = new UserController(
  userRepo,
  stateRepo,
  adRepo,
  categoryRepo,
  bcrypt,
  validator,
);

export default userController;
