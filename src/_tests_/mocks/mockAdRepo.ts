import { AdDoc, AdType } from "../../@types/Ad";
import { Filters, IAdsRepo } from "../../repository/adRepo";

export let fakeAd: AdType = {
  _id: "641c42136dc310a5d652c767",
  idUser: "6418592cae6ab60490031sa1",
  category: "6419c1502608ee23ad069047",
  images: [
    {
      url: `mockImage.png`,
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

export class MockAdRepo implements IAdsRepo {
  private ads: AdDoc[];

  constructor(Ad: AdType) {
    this.ads = [Ad] as AdDoc[];
    this.ads[0].save = jest.fn().mockReturnValue(this.ads[0]);
    this.ads[0].deleteOne = jest.fn().mockReturnValue(null);
  }

  async getAdsByUserId(status: boolean, userId: string) {
    const ad = this.ads.filter((ad) => ad.idUser === userId);

    return ad;
  }

  async getAdsByCategory(category: string) {
    const ad = this.ads.filter((ad) => ad.category === category);

    return ad;
  }

  async getAds(filters: Filters, sort: string, offset: number, limit: number) {
    let ads: AdDoc[];

    if (filters.title) {
      ads = this.ads.filter((ad) =>
        ad.title.toLowerCase().includes(filters.title?.$regex.toLowerCase()),
      );

      return ads;
    }

    ads = this.ads.filter((ad) => ad.status === true);

    return ads;
  }

  async getAdItem(id: string) {
    const ad = this.ads.find((ad) => ad._id === id) || null;

    return ad;
  }

  async getAdAndUpdate(id: string, updates: Partial<AdType>) {
    const ad = this.ads.find((ad) => ad._id === id) || null;

    return ad;
  }

  async createNewAd() {
    return this.ads[0];
  }

  async deleteAd(id: string) {
    const ad = this.ads.find((ad) => ad._id === id) || null;

    return ad;
  }
}
