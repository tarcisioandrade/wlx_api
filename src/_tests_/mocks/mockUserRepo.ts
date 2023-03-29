import { HydratedDocument } from "mongoose";

import { User, UserDoc } from "../../@types/User";
import { IUserRepo } from "../../repository/userRepo";

class MockUserRepo implements IUserRepo {
  private users: UserDoc[];

  constructor(User: User) {
    this.users = [User] as UserDoc[];
    this.users[0].save = jest.fn().mockReturnValue(this.users[0]);
  }

  async getUserByEmail(email: string) {
    const user = this.users.find((user) => user.email === email) || null;

    return Promise.resolve(user);
  }

  async getUserByToken(token: string) {
    const user = this.users.find((user) => user.token === token) || null;

    return Promise.resolve(user);
  }

  async createNewUser(user: User) {
    let newUser = user as UserDoc;
    newUser.save = jest.fn().mockReturnValue(newUser);

    return Promise.resolve(newUser);
  }
}

export default MockUserRepo;
