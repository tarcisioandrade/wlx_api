import { HydratedDocument } from "mongoose";

export type StateType = {
  name: string;
};

export type StateDoc = HydratedDocument<StateType>;
