import { HydratedDocument, Types } from "mongoose";

type ImagesAd = {
  url: string;
  default: boolean;
};

export type Ad = {
  id: Types.ObjectId | string;
  idUser: Types.ObjectId | string;
  category: string;
  images: ImagesAd[];
  created_at: Date;
  title: string;
  price: number;
  price_negotiable: boolean;
  description: string;
  views: number;
  status: boolean;
  state: string;
};

export type AdsList = {
  image: string;
} & Pick<Ad, "id" | "title" | "price" | "price_negotiable">;

export type AdDoc = HydratedDocument<Ad>;
