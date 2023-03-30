import { HydratedDocument } from "mongoose";

export type Category = {
  name: string;
  slug: string;
  _doc: any;
};

export type Categories = {
  img: string;
} & Category;

export type CategoryDoc = HydratedDocument<Category>;