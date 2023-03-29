import { HydratedDocument } from "mongoose";

export type State = {
  name: string;
}

export type StateDoc = HydratedDocument<State>;