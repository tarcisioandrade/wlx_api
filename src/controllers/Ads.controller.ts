import { Request, Response } from "express";
import mongoose from "mongoose";

import { AdsList, AdType } from "../@types/Ad";
import { Filters, IAdsRepo } from "../repository/adRepo";
import { ICategoryRepo } from "../repository/categoryRepo";
import { IStateRepo } from "../repository/stateRepo";
import { IUserRepo } from "../repository/userRepo";
import imageBuilder from "../utils/imageBuilder";
import fs from "fs";

type ImageBuilder = typeof imageBuilder;

class AdsController {
  private adRepo: IAdsRepo;
  private categoryRepo: ICategoryRepo;
  private stateRepo: IStateRepo;
  private userRepo: IUserRepo;
  private imageBuilder: ImageBuilder;

  constructor(
    adRepo: IAdsRepo,
    categoryRepo: ICategoryRepo,
    stateRepo: IStateRepo,
    userRepo: IUserRepo,
    imageBuilder: ImageBuilder,
  ) {
    this.adRepo = adRepo;
    this.categoryRepo = categoryRepo;
    this.stateRepo = stateRepo;
    this.userRepo = userRepo;
    this.imageBuilder = imageBuilder;

    this.getAds = this.getAds.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getAds = this.getAds.bind(this);
    this.getItem = this.getItem.bind(this);
    this.addAction = this.addAction.bind(this);
    this.editAction = this.editAction.bind(this);
    this.deleteAction = this.deleteAction.bind(this);
  }

  async getCategories(req: Request, res: Response) {
    const categories = await this.categoryRepo.getCategories();

    res.status(200).json({ categories });
  }

  async getAds(req: Request, res: Response) {
    const { sort = "asc", offset = 0, limit = 8, q, categ, state } = req.query;

    let filters: Filters = { status: true };

    if (q) filters.title = { $regex: q, $options: "i" };

    if (categ) {
      const category = await this.categoryRepo.getCategoryBySlug(
        categ as string,
      );

      if (category) filters.category = category._id;
    }

    if (state) {
      const stateDoc = await this.stateRepo.getStateByName(state as string);

      if (stateDoc) filters.state = stateDoc._id;
    }

    const totalAds = await this.adRepo.getTotalAds();
    const adsData = await this.adRepo.getAds(
      filters,
      sort as string,
      Number(offset),
      Number(limit),
    );

    let ads: AdsList[] = [];

    for (let i in adsData) {
      let image;

      let defaultImage = adsData[i].images.find((img) => img.default === true);

      if (defaultImage) {
        image = `${process.env.BASE}/assets/images/${defaultImage.url}`;
      } else {
        image = `${process.env.BASE}/assets/images/default.jpg`;
      }

      ads.push({
        id: adsData[i]._id,
        title: adsData[i].title,
        price: adsData[i].price,
        price_negotiable: adsData[i].price_negotiable,
        image,
      });
    }

    res.status(200).json({ ads, totalAds });
  }

  async getItem(req: Request, res: Response) {
    const { id } = req.params;
    const { other = null } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid ID!" });
      return;
    }

    const ad = await this.adRepo.getAdItem(id);

    if (!ad) {
      res.status(404).json({ error: "Ad not found" });
      return;
    }

    ad.views++;
    await ad.save();

    let images = [];

    if (ad.images.length === 0) {
      images.push(`${process.env.BASE}/assets/images/default.jpg`);
    } else {
      for (let i in ad.images) {
        images.push(`${process.env.BASE}/assets/images/${ad.images[i].url}`);
      }
    }

    const category = await this.categoryRepo.getCategoryById(ad.category);
    const state = await this.stateRepo.getStateByID(ad.state);
    const user = await this.userRepo.getUserById(ad.idUser.toString());

    let others: { sameUser: AdsList[]; sameCategory: AdsList[] } = {
      sameUser: [],
      sameCategory: [],
    };

    if (other) {
      const othersWithSameUser = await this.adRepo.getAdsByUserId(
        true,
        ad.idUser.toString(),
      );

      const othersWithSameCategory = await this.adRepo.getAdsByCategory(
        ad.category,
      );

      others.sameUser = othersWithSameUser
        .filter((otherAd) => otherAd._id.toString() !== ad._id.toString())
        .map((otherAd) => {
          const imageDefault = otherAd.images.find((e) => e.default === true);
          const image = imageDefault
            ? `${process.env.BASE}/assets/images/${imageDefault.url}`
            : `${process.env.BASE}/assets/images/default.jpg`;

          return {
            id: otherAd._id,
            title: otherAd.title,
            price: otherAd.price,
            price_negotiable: otherAd.price_negotiable,
            image,
          };
        });

      others.sameCategory = othersWithSameCategory
        .filter(
          (otherAd) =>
            otherAd._id.toString() !== ad._id.toString() &&
            otherAd.idUser.toString() !== ad.idUser.toString(),
        )
        .map((otherAd) => {
          const imageDefault = otherAd.images.find((e) => e.default === true);
          const image = imageDefault
            ? `${process.env.BASE}/assets/images/${imageDefault.url}`
            : `${process.env.BASE}/assets/images/default.jpg`;

          return {
            id: otherAd._id,
            title: otherAd.title,
            price: otherAd.price,
            price_negotiable: otherAd.price_negotiable,
            image,
          };
        });
    }

    res.json({
      id: ad._id,
      title: ad.title,
      price: ad.price,
      price_negotiable: ad.price_negotiable,
      description: ad.description,
      views: ad.views,
      created_at: ad.created_at,
      images,
      category,
      user: {
        name: user!.name,
        email: user!.email,
      },
      state: state!.name,
      others,
    });
  }

  async addAction(req: Request, res: Response) {
    let { title, price, priceNegotiable, desc, categ } = req.body;
    const token = req.cookies.token;

    const user = await this.userRepo.getUserByToken(token);

    if (!title || !categ) {
      res.status(400).json({ error: "Title or Category is missing!" });
      return;
    }

    if (mongoose.Types.ObjectId.isValid(categ)) {
      res.status(400).json({ error: "Invalid Category!" });
      return;
    }

    const category = await this.categoryRepo.getCategoryBySlug(categ);

    if (!category) {
      res.status(400).json({ error: "Category not found!" });
      return;
    }

    if (price) {
      price = parseFloat(
        price.replace(".", "").replace(",", ".").replace("R$ ", ""),
      );
    } else {
      price = 0;
    }

    const newAd = await this.adRepo.createNewAd();

    newAd.status = true;
    newAd.idUser = user!._id;
    newAd.created_at = new Date();
    newAd.state = user!.state;
    newAd.category = category._id.toString();
    newAd.title = title;
    newAd.price = price;
    newAd.price_negotiable = priceNegotiable === "true" ? true : false;
    newAd.description = desc;
    newAd.views = 0;

    if (req.files && req.files.img) {
      if (Array.isArray(req.files.img)) {
        for (let i = 0; i < req.files.img.length; i++) {
          if (
            ["image/jpeg", "image/jpg", "image/png"].includes(
              req.files.img[i].mimetype,
            )
          ) {
            const urlImage = await this.imageBuilder(req.files.img[i].data);
            newAd.images.push({
              url: urlImage,
              default: false,
            });
          }
        }
      } else {
        if (
          ["image/jpeg", "image/jpg", "image/png"].includes(
            req.files.img.mimetype,
          )
        ) {
          const urlImage = await this.imageBuilder(req.files.img.data);
          newAd.images.push({
            url: urlImage,
            default: false,
          });
        }
      }
    }

    if (newAd.images.length > 0) {
      newAd.images[0].default = true;
    }

    const info = await newAd.save();
    res.json({ id: info._id });
  }

  async editAction(req: Request, res: Response) {
    const { id } = req.params;
    let { title, price, priceNegotiable, desc, categ, status } = req.body;
    const token = req.cookies.token;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid ID!" });
      return;
    }

    const ad = await this.adRepo.getAdItem(id);

    if (!ad) {
      res.status(400).json({ error: "Ad not found!" });
      return;
    }

    const user = await this.userRepo.getUserByToken(token);

    if (user!._id.toString() !== ad.idUser.toString()) {
      res.status(400).json({ error: "Permission denied!" });
      return;
    }

    let updates: Partial<AdType> = {};

    if (title) {
      updates.title = title;
    }

    if (price) {
      price = parseFloat(
        price.replace(".", "").replace(",", ".").replace("R$ ", ""),
      );
      updates.price = price;
    }

    if (priceNegotiable) {
      updates.price_negotiable = priceNegotiable;
    }

    if (status) {
      updates.status = status;
    }

    if (desc) {
      updates.description = desc;
    }

    if (categ) {
      const category = await this.categoryRepo.getCategoryBySlug(categ);
      if (!category) {
        res.status(400).json({ error: "Category not found!" });
        return;
      }
      updates.category = category._id.toString();
    }

    if (req.files && req.files.img) {
      const newImages = [];

      if (Array.isArray(req.files.img)) {
        for (let i = 0; i < req.files.img.length; i++) {
          if (
            ["image/jpeg", "image/jpg", "image/png"].includes(
              req.files.img[i].mimetype,
            )
          ) {
            const urlImage = await this.imageBuilder(req.files.img[i].data);
            newImages.push({
              url: urlImage,
              default: false,
            });

            updates.images = newImages;
          }
        }
      } else {
        if (
          ["image/jpeg", "image/jpg", "image/png"].includes(
            req.files.img.mimetype,
          )
        ) {
          const urlImage = await this.imageBuilder(req.files.img.data);
          newImages.push({
            url: urlImage,
            default: false,
          });

          updates.images = newImages;
        }
      }
    }

    if (updates.images && updates.images.length > 0) {
      updates.images[0].default = true;
    }

    await this.adRepo.getAdAndUpdate(id, updates);

    res.status(200).end();
  }

  async deleteAction(req: Request, res: Response) {
    const { id } = req.params;
    const token = req.cookies.token;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid ID!" });
      return;
    }

    const ad = await this.adRepo.getAdItem(id);
    const user = await this.userRepo.getUserByToken(token);

    if (!ad) {
      res.status(400).json({ error: "Ad not found!" });
      return;
    }

    if (user!._id.toString() !== ad.idUser.toString()) {
      res.status(400).json({ error: "Permission denied!" });
      return;
    }

    for (let i in ad.images) {
      fs.unlinkSync(`./public/assets/images/${ad.images[i].url}`);
    }

    await ad.deleteOne();

    res.status(200).end();
  }
}

export default AdsController;
