import Reducer from "./Reducer";

export function createReducersFromConfig(reducersConfig = {}, allStates) {
  const members = {};
  for (const reducerName in reducersConfig) {
    members[reducerName] = new Reducer(
      reducerName,
      reducersConfig[reducerName],
      allStates
    );
  }
  return members;
}

export function createMachineConfigWithDefaults(machineConfig) {
  const {
    name = "localMachine",
    allStates = [],
    state: initialState = "start",
    value: initialValue = null,
    reducers: reducersConfig = {},
    stateTransitions = {},
    effects = {}
  } = machineConfig;
  return {
    name,
    allStates,
    initialState,
    initialValue,
    reducers: createReducersFromConfig(reducersConfig, allStates),
    stateTransitions,
    effects
  };
}
