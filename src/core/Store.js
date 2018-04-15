import _ from "lodash";
import Machine from "./Machine";

export const MACHINES = Symbol("MACHINES");

function createMachinesFromConfiguration(machineConfiguration) {
  const entries = _.entries(machineConfiguration);
  const machines = _.reduce(
    entries,
    (acc, currentValue) => {
      const [machineName, machineConfiguration] = currentValue;
      return {
        ...acc,
        [machineName]: new Machine({
          ...machineConfiguration,
          name: machineName
        })
      };
    },
    {}
  );
  return machines;
}

export default class Store {
  constructor(machineConfiguration) {
    this[MACHINES] = createMachinesFromConfiguration(machineConfiguration);
  }
  getMachines() {
    return this[MACHINES];
  }
  getData() {
    const result = {};
    for (const machineName in this[MACHINES]) {
      const machine = this[MACHINES][machineName];
      result[machine.getName()] = {
        value: machine.getValue(),
        state: machine.getState()
      };
    }
    return result;
  }
  getMachinesFromMachineNames(machineNamesList) {
    return machineNamesList.map(name => this[MACHINES][name]);
  }
  subscribeTo(machineNamesList) {
    console.log(this[MACHINES], machineNamesList);
  }
}
