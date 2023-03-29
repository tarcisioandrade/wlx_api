import mongoose, { Model } from "mongoose";

import { State } from "../@types/State";

const stateSchema = new mongoose.Schema<State>({
  name: String,
});

const modelName = "State";

export default mongoose.connection && mongoose.connection.models[modelName]
  ? (mongoose.connection.models[modelName] as Model<State>)
  : mongoose.model<State>(modelName, stateSchema);
