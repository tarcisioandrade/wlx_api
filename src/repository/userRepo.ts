import { UserDoc, User as UserType } from "../@types/User";
import User from "../models/User";

export interface IUserRepo {
  getUserByToken(token: string): Promise<UserDoc | null>;
  getUserByEmail(email: string): Promise<UserDoc | null>;
  createNewUser: (user: UserType) => Promise<UserDoc>;
}

export class UserRepo implements IUserRepo {
  async getUserByToken(token: string) {
    const user = await User.findOne({ token });

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await User.findOne({ email });

    return user;
  }

  async createNewUser(user: UserType) {
    const newUser = new User(user);

    return newUser;
  }
}
