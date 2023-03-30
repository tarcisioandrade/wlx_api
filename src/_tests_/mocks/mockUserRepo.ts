import { HydratedDocument } from "mongoose";

import { User, UserDoc } from "../../@types/User";
import { IUserRepo } from "../../repository/userRepo";

type UserWithID = User & { _id: string };

export const fakeUser: UserWithID = {
  _id: "6418592cae6ab60490031sa1",
  email: "Teste@gmail.com",
  name: "Teste",
  password: "123456",
  token: "MeuToken",
  state: "6418592cae6ab60490031ca0",
};

export class MockUserRepo implements IUserRepo {
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

  async findUserAndUpdate(token: string, updates: Partial<User>) {
    const user = this.users.find((user) => user.token === token) || null;

    if (user) {
      user.email = updates.email || user.email;
      user.name = updates.name || user.name;
      user.password = updates.password || user.password;
      user.state = updates.state || user.state;
    }

    return Promise.resolve(user);
  }
}

