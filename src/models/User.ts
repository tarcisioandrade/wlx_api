import mongoose, { Model } from "mongoose";

import { User } from "../@types/User";

const userSchema = new mongoose.Schema<User>({
  name: String,
  email: String,
  state: String,
  password: String,
  token: String,
});

const modelName = "User";

export default mongoose.connection && mongoose.connection.models[modelName]
  ? (mongoose.connection.models[modelName] as Model<User>)
  : mongoose.model<User>(modelName, userSchema);
