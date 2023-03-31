import { UserDoc, UserType } from "../@types/User";
import User from "../models/User";

export interface IUserRepo {
  getUserByToken(token: string): Promise<UserDoc | null>;
  getUserByEmail(email: string): Promise<UserDoc | null>;
  createNewUser(user: UserType): Promise<UserDoc>;
  findUserAndUpdate(
    token: string,
    updates: Partial<UserType>,
  ): Promise<UserDoc | null>;
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

  async findUserAndUpdate(token: string, updates: Partial<UserType>) {
    const user = await User.findOneAndUpdate({ token }, { $set: updates });

    return user;
  }
}
