import { StateDoc } from "../@types/State";
import State from "../models/State";

export interface IStateRepo {
  getStateByID(stateId: string): Promise<StateDoc | null>;
  getStates(): Promise<StateDoc[]>;
}

export class StateRepo implements IStateRepo {
  async getStateByID(stateId: string) {
    const state = await State.findById(stateId);

    return state;
  }

  async getStates() {
    const states = await State.find();

    return states;
  }
}
