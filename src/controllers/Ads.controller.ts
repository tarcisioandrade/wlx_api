import { randomUUID } from "crypto";
import fs from "fs";

import { Request, Response } from "express";
import jimp from "jimp";
import mongoose, { Types } from "mongoose";

import { AdsList, AdType } from "../@types/Ad";
import { Categories } from "../@types/Category";
import Ad from "../models/Ad";
import Category from "../models/Category";
import State from "../models/State";
import User from "../models/User";

async function addImage(buffer: Buffer) {
  const newName = `${randomUUID()}.jpg`;
  const tmpImage = await jimp.read(buffer);

  tmpImage
    .cover(500, 500)
    .quality(80)
    .write(`./public/assets/images/${newName}`);

  return newName;
}

export const getCategories = async (req: Request, res: Response) => {
  const categs = await Category.find();
  let categories: Categories[] = [];

  for (let i in categs) {
    categories.push({
      ...categs[i]._doc,
      img: `${process.env.BASE}/assets/images/${categs[i].slug}.png`,
    });
  }

  res.json({ categories });
};

export const getList = async (req: Request, res: Response) => {
  const { sort = "asc", offset = 0, limit = 8, q, categ, state } = req.query;

  type Filters = {
    status: boolean;
    title?: Record<"$regex" | "$options", unknown>;
    category?: Types.ObjectId;
    state?: Types.ObjectId;
  };

  let filters: Filters = { status: true };

  if (q) {
    filters.title = { $regex: q, $options: "i" };
  }

  if (categ) {
    const targetCateg = await Category.findOne({ slug: categ });

    if (targetCateg) {
      filters.category = targetCateg._id;
    }
  }

  if (state) {
    const stateTarget = await State.findOne({
      name: { $regex: state, $options: "i" },
    });
    if (stateTarget) {
      filters.state = stateTarget._id;
    }
  }

  const adsTotal = await Ad.find(filters).countDocuments();

  const adsData = await Ad.find(filters)
    .sort({ created_at: sort === "desc" ? -1 : 1 })
    .skip(Number(offset))
    .limit(Number(limit));

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

  res.json({ ads, adsTotal });
};

export const getItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { other = null } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid ID!" });
    return;
  }

  const ad = await Ad.findById(id);

  if (!ad) {
    res.status(400).json({ error: "Ad not found!" });
    return;
  }

  ad.views++;
  await ad.save();

  let images: string[] = [];

  if (ad.images.length === 0) {
    images.push(`${process.env.BASE}/assets/images/default.jpg`);
  } else {
    for (let i in ad.images) {
      images.push(`${process.env.BASE}/assets/images/${ad.images[i].url}`);
    }
  }

  const category = await Category.findById(ad.category);
  const user = await User.findById(ad.idUser);
  const state = await State.findById(ad.state);

  let others: { sameUser: AdsList[]; sameCategory: AdsList[] } = {
    sameUser: [],
    sameCategory: [],
  };

  if (other) {
    const othersWithSameUser = await Ad.find({
      status: true,
      idUser: ad.idUser,
    });
    const othersWithSameCategory = await Ad.find({
      status: true,
      category: ad.category,
    });

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
};

export const addAction = async (req: Request, res: Response) => {
  let { title, price, priceNegotiable, desc, categ } = req.body;
  const token = req.cookies.token;

  const user = await User.findOne({ token });

  if (!title || !categ) {
    res.status(400).json({ error: "Title or Category is missing!" });
    return;
  }

  if (mongoose.Types.ObjectId.isValid(categ)) {
    res.status(400).json({ error: "Invalid Category!" });
    return;
  }

  const category = await Category.findOne({ slug: categ });

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

  const newAd = new Ad();

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
          const urlImage = await addImage(req.files.img[i].data);
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
        const urlImage = await addImage(req.files.img.data);
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
};

export const editAction = async (req: Request, res: Response) => {
  const { id } = req.params;
  let { title, price, priceNegotiable, desc, categ, status } = req.body;
  const token = req.cookies.token;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid ID!" });
    return;
  }

  const ad = await Ad.findById(id);

  if (!ad) {
    res.status(400).json({ error: "Ad not found!" });
    return;
  }

  const user = await User.findOne({ token });

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
    const category = await Category.findOne({ slug: categ });
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
          const urlImage = await addImage(req.files.img[i].data);
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
        const urlImage = await addImage(req.files.img.data);
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

  await Ad.findByIdAndUpdate(id, { $set: updates });

  res.status(200).end();
};

export const deleteAction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.cookies.token;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid ID!" });
    return;
  }

  const ad = await Ad.findById(id);
  const user = await User.findOne({ token });

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
};
