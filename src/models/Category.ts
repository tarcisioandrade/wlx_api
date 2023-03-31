import mongoose, { Model } from "mongoose";

import { CategoryType } from "../@types/Category";

const categorySchema = new mongoose.Schema<CategoryType>({
  name: String,
  slug: String,
});

const modelName = "Category";

export default mongoose.connection && mongoose.connection.models[modelName]
  ? (mongoose.connection.models[modelName] as Model<CategoryType>)
  : mongoose.model<CategoryType>(modelName, categorySchema);
