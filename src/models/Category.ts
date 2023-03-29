import mongoose, { Model } from "mongoose";

import { Category } from "../@types/Category";

const categorySchema = new mongoose.Schema<Category>({
  name: String,
  slug: String,
});

const modelName = "Category";

export default mongoose.connection && mongoose.connection.models[modelName]
  ? (mongoose.connection.models[modelName] as Model<Category>)
  : mongoose.model<Category>(modelName, categorySchema);
