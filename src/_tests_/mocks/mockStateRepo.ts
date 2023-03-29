import { State, StateDoc } from "../../@types/State";
import { IStateRepo } from "../../repository/stateRepo";

class MockStateRepo implements IStateRepo {
  private states: StateDoc[];

  constructor(State: State) {
    this.states = [State] as StateDoc[];
    this.states[0].save = jest.fn().mockReturnValue(this.states[0]);
  }

  async getStateByID(state: string) {
    const State = this.states.find((State) => State.name === state) || null;

    return Promise.resolve(State);
  }
}

export default MockStateRepo;
