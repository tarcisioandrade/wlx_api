import { AdDoc } from "../@types/Ad";
import Ad from "../models/Ad";

export interface IAdRepo {
  getAdsByUserId(userId: string): Promise<AdDoc[]>;
}

export class AdRepo implements IAdRepo {
  async getAdsByUserId(userId: string) {
    const ads = await Ad.find({ idUser: userId });
    return ads;
  }
}
