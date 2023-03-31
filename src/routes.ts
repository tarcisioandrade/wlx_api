import express from "express";

import { routePrivate } from "./middlewares/Auth";
import AdsController from "./services/AdsService";
import AuthController from "./services/AuthService";
import UserController from "./services/UserService";

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
router.get("/ad/all", AdsController.getAds);
router.get("/ad/:id", AdsController.getItem);
router.post("/ad/:id", routePrivate, AdsController.editAction);
router.delete("/ad/:id", routePrivate, AdsController.deleteAction);

export default router;
