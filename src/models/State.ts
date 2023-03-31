import mongoose, { Model } from "mongoose";

import { StateType } from "../@types/State";

const stateSchema = new mongoose.Schema<StateType>({
  name: String,
});

const modelName = "State";

export default mongoose.connection && mongoose.connection.models[modelName]
  ? (mongoose.connection.models[modelName] as Model<StateType>)
  : mongoose.model<StateType>(modelName, stateSchema);
