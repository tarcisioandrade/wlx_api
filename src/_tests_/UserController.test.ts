import bcrypt from "bcrypt";
import { Request, Response } from "express";

import UserController from "../controllers/User.controller";
import validator from "../utils/Validator";
import { fakeAd, MockAdRepo } from "./mocks/mockAdRepo";
import { fakeCategory, MockCategoryRepo } from "./mocks/mockCategoryRepo";
import { fakeState, MockStateRepo } from "./mocks/mockStateRepo";
import { fakeUser, MockUserRepo } from "./mocks/mockUserRepo";

let userController: UserController;

const mockResponse = () => {
  let res = {} as Response;
  let req = {} as Request;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  req.cookies = jest.fn().mockReturnValue(req);
  return { req, res };
};

describe("UserController", () => {
  beforeEach(() => {
    const userRepo = new MockUserRepo(fakeUser);
    const stateRepo = new MockStateRepo(fakeState);
    const adRepo = new MockAdRepo(fakeAd);
    const categoryRepo = new MockCategoryRepo(fakeCategory);
    userController = new UserController(
      userRepo,
      stateRepo,
      adRepo,
      categoryRepo,
      bcrypt,
      validator,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return user info", async () => {
    let { req, res } = mockResponse();
    req.cookies.token = fakeUser.token;

    await userController.info(req, res);

    expect(res.json).toBeCalledWith({
      name: fakeUser.name,
      email: fakeUser.email,
      state: fakeUser.state,
      ads: [{ ...fakeAd, category: fakeCategory.slug }],
    });
  });

  it("should return all states", async () => {
    let { req, res } = mockResponse();

    await userController.getStates(req, res);

    expect(res.json).toBeCalledWith({ states: [fakeState] });
  });

  it("should edit user info", async () => {
    let { req, res } = mockResponse();
    req.cookies.token = fakeUser.token;
    req.body = {
      name: "New Name",
    };

    await userController.editAction(req, res);

    expect(res.sendStatus).toBeCalledWith(200);
  });

  it("should return status 400 with email already in use", async () => {
    let { req, res } = mockResponse();
    req.cookies.token = fakeUser.token;
    req.body = {
      email: fakeUser.email,
    };
    await userController.editAction(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ error: "Email already in use." });
  });

  it("shold return status 400 with invalid email", async () => {
    let { req, res } = mockResponse();
    req.cookies.token = fakeUser.token;
    req.body = {
      email: "invalidEmail",
    };
    await userController.editAction(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({
      error: [{ message: "Invalid email", path: "email" }],
    });
  });
});
