import { AdDoc, AdType } from "../../@types/Ad";
import { IAdRepo } from "../../repository/adRepo";

export const fakeAd: AdType = {
  id: "6418592cae6ab60490031xi1",
  idUser: "6418592cae6ab60490031sa1",
  category: "6418592cae6ab60490031ca2",
  images: [
    {
      url: "http://localhost:3333/assets/images/default.jpg",
      default: true,
    },
  ],
  created_at: new Date(),
  title: "Teste",
  price: 100,
  price_negotiable: false,
  description: "Teste",
  views: 0,
  status: true,
  state: "6418592cae6ab60490031ca0",
};

export class MockAdRepo implements IAdRepo {
  private ads: AdDoc[];

  constructor(Ad: AdType) {
    this.ads = [Ad] as AdDoc[];
  }

  async getAdsByUserId(userId: string) {
    const ad = this.ads.filter((ad) => ad.idUser === userId);

    return ad;
  }
}
