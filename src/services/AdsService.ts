import AdsController from "../controllers/Ads.controller";
import { AdRepo } from "../repository/adRepo";
import { CategoryRepo } from "../repository/categoryRepo";
import { StateRepo } from "../repository/stateRepo";
import { UserRepo } from "../repository/userRepo";
import imageBuilder from "../utils/imageBuilder";

const adRepo = new AdRepo();
const categoryRepo = new CategoryRepo();
const stateRepo = new StateRepo();
const userRepo = new UserRepo();

const adsController = new AdsController(
  adRepo,
  categoryRepo,
  stateRepo,
  userRepo,
  imageBuilder,
);

export default adsController;
