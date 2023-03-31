import { HydratedDocument } from "mongoose";

export type CategoryType = {
  name: string;
  slug: string;
  _doc: any;
};

export type Categories = {
  img: string;
} & CategoryType;

export type CategoryDoc = HydratedDocument<CategoryType>;