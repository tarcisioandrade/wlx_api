import mongoose, { connection, Model } from "mongoose";

import { AdType } from "../@types/Ad";

const adSchema = new mongoose.Schema<AdType>({
  idUser: String,
  category: String,
  images: [Object],
  created_at: Date,
  title: String,
  price: Number,
  price_negotiable: Boolean,
  description: String,
  views: Number,
  status: String,
  state: String,
});

const modelName = "Ad";

export default connection && connection.models[modelName]
  ? (connection.models[modelName] as Model<AdType>)
  : mongoose.model<AdType>(modelName, adSchema);
