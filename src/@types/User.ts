import { HydratedDocument } from "mongoose";

export type User = {
  name: string;
  email: string;
  state: string;
  password: string;
  token: string;
};

export type UserDoc = HydratedDocument<User>;
