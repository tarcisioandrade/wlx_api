import { State, StateDoc } from "../../@types/State";
import { IStateRepo } from "../../repository/stateRepo";

export const fakeState: State = {
  name: "6418592cae6ab60490031ca0",
};

export class MockStateRepo implements IStateRepo {
  private states: StateDoc[];

  constructor(State: State) {
    this.states = [State] as StateDoc[];
    this.states[0].save = jest.fn().mockReturnValue(this.states[0]);
  }

  async getStateByID(state: string) {
    const State = this.states.find((State) => State.name === state) || null;

    return Promise.resolve(State);
  }

  async getStates() {
    return Promise.resolve(this.states);
  }
}

