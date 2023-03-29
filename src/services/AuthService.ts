import bcrypt from "bcrypt";

import AuthController from "../controllers/Auth.controller";
import { StateRepo } from "../repository/stateRepo";
import { UserRepo } from "../repository/userRepo";
import validator from "../utils/Validator";

const useRepo = new UserRepo();
const stateRepo = new StateRepo();

const authController = new AuthController(
  useRepo,
  stateRepo,
  validator,
  bcrypt,
);

export default authController;
