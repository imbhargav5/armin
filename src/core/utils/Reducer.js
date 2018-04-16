import _ from "lodash";

export const NAME = Symbol("NAME");
export const FOR_STATES = Symbol("FOR_STATES");
export const COMPUTE_NEXT_VALUE = Symbol("COMPUTE_NEXT_VALUE");
export const COMPUTE_NEXT_STATE = Symbol("COMPUTE_NEXT_STATE");

export const NOOP_COMPUTE_NEXT_STATE = ({ state }) => state;
export const NOOP_COMPUTE_NEXT_VALUE = ({ value }) => value;

export default class Reducer {
  static getMembersFromConfiguration(configuration, allStates) {
    let forStates = allStates,
      computeNextValue = NOOP_COMPUTE_NEXT_VALUE,
      computeNextState = NOOP_COMPUTE_NEXT_STATE;
    if (_.isFunction(configuration)) {
      // generate forStates and computeNextState
      // configuration is computeNextValue
      computeNextValue = configuration;
    } else if (_.isObject(configuration)) {
      const {
        from: _forStates = allStates,
        setValue: _computeNextValue = NOOP_COMPUTE_NEXT_VALUE,
        setState: _computeNextState = NOOP_COMPUTE_NEXT_STATE
      } = configuration;
      if (
        !_.isFunction(computeNextValue) ||
        !_.isFunction(computeNextState) ||
        !Array.isArray(forStates)
      ) {
        throw new Error("Invalid config");
      }
      forStates = _forStates;
      computeNextValue = _computeNextValue;
      computeNextState = _computeNextState;
    } else {
      throw new Error("Expected an object or a function");
    }
    return {
      forStates,
      computeNextValue,
      computeNextState
    };
  }
  constructor(name, configuration, allStates) {
    const {
      forStates,
      computeNextValue,
      computeNextState
    } = Reducer.getMembersFromConfiguration(configuration, allStates);
    this[NAME] = name;
    this[FOR_STATES] = forStates;
    this[COMPUTE_NEXT_STATE] = computeNextState;
    this[COMPUTE_NEXT_VALUE] = computeNextValue;
  }
  getName() {
    return this[NAME];
  }
  canDispatch(state) {
    return this[FOR_STATES].includes(state);
  }
  dispatch(opts, ...restArgs) {
    const nextValue = this[COMPUTE_NEXT_VALUE](opts, ...restArgs);
    const nextState = this[COMPUTE_NEXT_STATE](opts, nextValue, ...restArgs);
    return {
      nextValue,
      nextState
    };
  }
}
