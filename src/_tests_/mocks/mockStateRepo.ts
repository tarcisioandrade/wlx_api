import { StateDoc, StateType } from "../../@types/State";
import { IStateRepo } from "../../repository/stateRepo";

export const fakeState: StateType = {
  name: "6418592cae6ab60490031ca0",
};

export class MockStateRepo implements IStateRepo {
  private states: StateDoc[];

  constructor(State: StateType) {
    this.states = [State] as StateDoc[];
    this.states[0].save = jest.fn().mockReturnValue(this.states[0]);
  }

  async getStateByID(state: string) {
    const stateTarget =
      this.states.find((State) => State.name === state) || null;

    return stateTarget;
  }

  async getStateByName(state: string) {
    const stateTarget = this.states.find((State) => State.name === state) || null;

    return stateTarget;
  }

  async getStates() {
    return this.states;
  }
}
