import express from "express";

import * as AdsController from "./controllers/Ads.controller";
import * as UserController from "./controllers/User.controller";
import { routePrivate } from "./middlewares/Auth";
import AuthController from "./services/AuthService";

const router = express.Router();

router.get("/states", UserController.getStates);

router.post("/user/signup", AuthController.signup);
router.post("/user/signin", AuthController.signin);
router.get("/user/signout", routePrivate, AuthController.signout);
router.get("/user/authentication", routePrivate, AuthController.authentication);

router.get("/user/me", routePrivate, UserController.info);
router.patch("/user/me", routePrivate, UserController.editAction);

router.get("/categories", AdsController.getCategories);

router.post("/ad/add", routePrivate, AdsController.addAction);
router.get("/ad/list", AdsController.getList);
router.get("/ad/:id", AdsController.getItem);
router.post("/ad/:id", routePrivate, AdsController.editAction);
router.delete("/ad/:id", routePrivate, AdsController.deleteAction);

export default router;
