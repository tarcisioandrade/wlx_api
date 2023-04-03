import { Types } from "mongoose";

import { AdDoc, AdType } from "../@types/Ad";
import Ad from "../models/Ad";

export type Filters = {
  status: boolean;
  title?: Record<"$regex" | "$options", any>;
  category?: Types.ObjectId;
  state?: Types.ObjectId;
};

export interface IAdsRepo {
  getAdsByUserId(status: boolean | null, userId: string): Promise<AdDoc[]>;
  getAdsByCategory(category: string): Promise<AdDoc[]>;
  getAds(
    filters: Filters,
    sort: string,
    offset: number,
    limit: number,
  ): Promise<AdDoc[]>;
  getAdItem(id: string): Promise<AdDoc | null>;
  getAdAndUpdate(id: string, updates: Partial<AdType>): Promise<AdDoc | null>;
  createNewAd(): Promise<AdDoc>;
}

export class AdRepo implements IAdsRepo {
  async getAdsByUserId(status: boolean | null = null, userId: string) {
    let ads: AdDoc[];

    if (status === null) {
      ads = await Ad.find({ idUser: userId });
    } else if (status === true) {
      ads = await Ad.find({ idUser: userId, status: true });
    } else {
      // if status is false
      ads = await Ad.find({ idUser: userId, status: false });
    }

    return ads;
  }

  async getAds(filters: Filters, sort: string, offset: number, limit: number) {
    const ads = await Ad.find(filters)
      .sort({ created_at: sort === "desc" ? -1 : 1 })
      .skip(offset)
      .limit(limit);

    return ads;
  }

  async getAdItem(id: string) {
    const ad = await Ad.findById(id);

    return ad;
  }

  async getAdsByCategory(id: string) {
    const ad = await Ad.find({
      status: true,
      category: id,
    });

    return ad;
  }

  async getAdAndUpdate(id: string, updates: Partial<AdType>) {
    const ad = Ad.findByIdAndUpdate(id, { $set: updates });

    return ad;
  }

  async createNewAd() {
    const ad = new Ad();

    return ad;
  }
}
