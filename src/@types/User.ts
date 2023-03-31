import { HydratedDocument } from "mongoose";

export type UserType = {
  name: string;
  email: string;
  state: string;
  password: string;
  token: string;
};

export type UserDoc = HydratedDocument<UserType>;
