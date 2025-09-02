// INDEV - This feature is still under development!

import { Ticking } from "./ticking";

type Condition = () => boolean;

interface Transitions {
  condition: Condition;
  state: string;
}

interface State {
  onEntry: Function;
  onExit: Function;
  transitions: Transitions[];
}

/**
 * An animation controller for scripting.
 */
export class StateController extends Ticking {
  readonly id: string;
  #lastId = 0;
  defaultState: string;
  currentState: string;
  states: { [key: string]: State };

  constructor(
    defaultState: string = "default",
    tickInterval?: number,
    prefix?: string,
    id?: string,
  ) {
    super(tickInterval);
    this.id = `${prefix}.${id ?? this.#lastId++}`;
    this.defaultState = defaultState;
    this.currentState = this.defaultState;
    this.states = {};
  }

  /**
   * desc
   * @param {string} name
   * @param {Function} condition
   * @param {Function} onEntry
   * @param {Function} onExit
   * @returns
   */
  addState(name: string, state: State): StateController {
    this.states[name] = state;
    return this;
  }

  /**
   * Remove this state.
   * @param {string} name
   */
  removeState(name: string): void {
    delete this.states[name];
  }

  onEntry(): void {
    this.states[this.currentState].onEntry(this);
  }

  onExit(): void {
    this.states[this.currentState].onExit(this);
  }

  tick(): void {
    const state = this.states[this.currentState];
    if (!state) {
      this.remove();
      throw new Error(`State ${this.currentState} not found!`);
    }
    for (const transition of state.transitions) {
      if (!transition.condition()) continue;
      this.onExit();
      this.currentState = transition.state;
      this.onEntry();
    }
  }
}

// export function test() {
//   // https://learn.microsoft.com/en-us/minecraft/creator/documents/animations/animationcontroller?view=minecraft-bedrock-stable
//   var value = false;
//   var con = new StateController();
//   con.addState("default", {
//     transitions: [
//       {
//         state: "grazing",
//         condition: () => {
//           return value;
//         },
//       },
//     ],
//     onEntry: () => {
//       console.warn("enter default");
//     },
//     onExit: () => {
//       console.warn("exit default");
//     },
//   });
//   con.addState("grazing", {
//     transitions: [
//       {
//         state: "default",
//         condition: () => {
//           return !value;
//         },
//       },
//     ],
//     onEntry: () => {
//       console.warn("enter grazing");
//     },
//     onExit: () => {
//       console.warn("exit grazing");
//     },
//   });
//   return value;
// }
