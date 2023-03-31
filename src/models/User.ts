import mongoose, { Model } from "mongoose";

import { UserType } from "../@types/User";

const userSchema = new mongoose.Schema<UserType>({
  name: String,
  email: String,
  state: String,
  password: String,
  token: String,
});

const modelName = "User";

export default mongoose.connection && mongoose.connection.models[modelName]
  ? (mongoose.connection.models[modelName] as Model<UserType>)
  : mongoose.model<UserType>(modelName, userSchema);
