import AuthController from "@/controllers/Auth.controller";
import validator from "@/utils/Validator";
import { fakeState, MockStateRepo } from "./mocks/mockStateRepo";
import { fakeUser, MockUserRepo } from "./mocks/mockUserRepo";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

let authController: AuthController;

const mockResponse = () => {
  const res = {} as Response;
  const req = {
    body: {
      email: fakeUser.email,
      password: fakeUser.password,
    },
  } as Request;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return { req, res };
};

describe("AuthController", () => {
  beforeEach(async () => {
    const userRepo = new MockUserRepo(fakeUser);
    const stateRepo = new MockStateRepo(fakeState);

    authController = new AuthController(userRepo, stateRepo, validator, bcrypt);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Signin", () => {
    it("should return 200 with valid user", async () => {
      let { req, res } = mockResponse();

      jest.spyOn(bcrypt, "compare").mockReturnValue(true as any);

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        email: fakeUser.email,
        token: fakeUser.token,
      });
    });

    it("should return 401 with invalid user", async () => {
      let { req, res } = mockResponse();
      req.body.email = "IncorrectEmailUser@gmail.com";

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "E-mail or password incorrect.",
      });
    });

    it("should return 400 with invalid body", async () => {
      let { req, res } = mockResponse();
      req.body = {
        email: "teste@gmail.com",
      };

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: [
          {
            path: "password",
            message: "Required",
          },
        ],
      });
    });
  });

  describe("Signup", () => {
    it("should return 200 with valid user", async () => {
      let { req, res } = mockResponse();
      req.body = {
        email: "opa@gmail.com",
        name: "Teste",
        password: "123456",
        state: "6418592cae6ab60490031ca0",
      };

      await authController.signup(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it("shold status 409 and message 'E-mail already registered.'", async () => {
      let { req, res } = mockResponse();

      req.body = {
        email: "Teste@gmail.com",
        name: "Teste",
        password: "123456",
        state: "6418592cae6ab60490031ca0",
      };

      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "E-mail already registered.",
      });
    });

    it("should return status 400 for invalid state", async () => {
      let { req, res } = mockResponse();

      req.body = {
        email: "Teste@gmail.com",
        name: "Teste",
        password: "123456",
        state: "Invalid State",
      };
      await authController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
