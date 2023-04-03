import { Request, Response } from "express";

import AdsController from "../controllers/Ads.controller";
import imageBuilder from "../utils/imageBuilder";
import { fakeAd, MockAdRepo } from "./mocks/mockAdRepo";
import { fakeCategory, MockCategoryRepo } from "./mocks/mockCategoryRepo";
import { fakeState, MockStateRepo } from "./mocks/mockStateRepo";
import { fakeUser, MockUserRepo } from "./mocks/mockUserRepo";
import fs from "fs";

require("dotenv").config();

let adsController: AdsController;

const mockResponse = () => {
  let res = {} as Response;
  let req = {} as Request;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  req.cookies = jest.fn().mockReturnValue(req);
  req.query = jest.fn().mockReturnValue(req) as Record<string, any>;
  req.files = jest.fn().mockReturnValue(req) as Record<string, any>;
  return { req, res };
};

describe("AdsController", () => {
  beforeEach(() => {
    const adRepo = new MockAdRepo(fakeAd);
    const userRepo = new MockUserRepo(fakeUser);
    const categoryRepo = new MockCategoryRepo(fakeCategory);
    const stateRepo = new MockStateRepo(fakeState);

    adsController = new AdsController(
      adRepo,
      categoryRepo,
      stateRepo,
      userRepo,
      imageBuilder,
    );
  });
  it("should return all categories", async () => {
    const { req, res } = mockResponse();

    await adsController.getCategories(req, res);

    const resExpected = {
      categories: [{ ...fakeCategory, img: `mockImage.png` }],
    };

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resExpected);
  });

  it("should return all ads and a length of total", async () => {
    const { req, res } = mockResponse();

    await adsController.getAds(req, res);

    const resExpected = {
      ads: [
        {
          _id: fakeAd._id,
          title: fakeAd.title,
          price: fakeAd.price,
          price_negotiable: fakeAd.price_negotiable,
          image: `${process.env.BASE}/assets/images/${fakeAd.images[0].url}`,
        },
      ],
      totalAds: 1,
    };

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resExpected);
  });

  it("should return totalAds: 0, when search by title no match results", async () => {
    const { req, res } = mockResponse();

    req.query = {
      q: "search any",
    };

    await adsController.getAds(req, res);

    const resExpected = {
      ads: [],
      totalAds: 0,
    };

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resExpected);
  });

  it("should return info of ad", async () => {
    const { req, res } = mockResponse();
    req.params = {
      id: fakeAd._id.toString(),
    };

    const resExpected = {
      id: fakeAd._id,
      title: fakeAd.title,
      price: fakeAd.price,
      price_negotiable: fakeAd.price_negotiable,
      description: fakeAd.description,
      views: fakeAd.views + 1,
      created_at: fakeAd.created_at,
      images: [`${process.env.BASE}/assets/images/${fakeAd.images[0].url}`],
      category: {
        ...fakeCategory,
      },
      user: {
        name: fakeUser.name,
        email: fakeUser.email,
      },
      state: fakeState.name,
      others: {
        sameUser: [],
        sameCategory: [],
      },
    };

    await adsController.getItem(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resExpected);
  });
  it("should create a new ad", async () => {
    const { req, res } = mockResponse();
    req.cookies = {
      token: "MeuToken",
    };
    req.body = {
      title: "My new AD",
      price: "R$ 100,00",
      priceNegotiable: "true",
      desc: "My new AD description",
      categ: fakeCategory._id.toString(),
    };

    await adsController.addAction(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: fakeAd._id });
  });

  it("should edit a ad", async () => {
    const { req, res } = mockResponse();
    req.cookies.token = "MeuToken";
    req.params = {
      id: fakeAd._id.toString(),
    };
    req.body = {
      title: "My edit AD",
    };

    await adsController.editAction(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });

  it("should delete a ad", async () => {
    const { req, res } = mockResponse();
    req.cookies.token = "MeuToken";
    req.params = {
      id: fakeAd._id.toString(),
    };

    jest.spyOn(fs, "unlinkSync").mockImplementation(() => true);
    
    await adsController.deleteAction(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });
});
