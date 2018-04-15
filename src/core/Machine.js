import React from "react";
import PropTypes from "prop-types";

import createReactContext from "create-react-context";
import { createMachineConfigWithDefaults } from "./utils/index";

export const ALL_STATES = Symbol("ALL_STATES");
export const INTERNAL_STATE = Symbol("INTERNAL_STATE");
export const INTERNAL_VALUE = Symbol("INTERNAL_VALUE");
export const REDUCERS = Symbol("REDUCERS");
export const EFFECTS = Symbol("EFFECTS");
export const LISTENERS = Symbol("LISTENERS");
export const MACHINE_NAME = Symbol("NAME");

// This function will add reducers
// as methods on to the controller
export function createControllerMembersFromReducers() {
  const reducers = this[REDUCERS];
  const members = {};
  for (const key in reducers) {
    // Create a function that has access to
    // value and state as the first argument
    // pass the original args in order
    members[key] = (...args) => {
      // invoke the original function inside
      // reducers
      const currentState = this.getState();
      const currentValue = this.getValue();
      try {
        const reducer = reducers[key];
        // can the reducer dispatch?
        if (reducer.canDispatch(currentState)) {
          const { nextValue, nextState } = reducer.dispatch(
            {
              value: currentValue,
              state: currentState
            },
            ...args
          );
          // Update internal value
          this.setValue(nextValue);
          this.setState(nextState);
          // Broadcast changes to listeners
          this.broadcast();
          return nextValue;
        } else {
          // No valid action
          console.warn(
            `${reducer.getName()} has no valid action for state ${currentState}. Aborting.`
          );
          return currentValue;
        }
      } catch (err) {
        console.error(err);
      }
    };
  }
  return members;
}

export function createControllerMembersFromEffects() {
  const effects = this[EFFECTS];
  const members = {};
  for (const key in effects) {
    // Create a function that has access to
    // value and state as the first argument
    // pass the original args in order
    const machine = this;
    members[key] = function(...args) {
      console.log("effects", this);
      // we want the controller to be able to call it's members
      // from it's effects
      // hence we call it with the this reference
      // we do not update values here;
      return effects[key].call(
        this,
        {
          value: machine.getValue(),
          state: machine.getState()
        },
        ...args
      );
    };
  }
  return members;
}

// this function will tell whether a particular reducer
// can dispatch in the current state or not
export function getReducerDispatchablities() {
  const reducers = this[REDUCERS];
  const currentState = this.getState();
  const members = {};
  for (const reducerName in reducers) {
    members[reducerName] = reducers[reducerName].canDispatch(currentState);
  }
  return members;
}

// this function will tell whether the machine is
// in a particular state or not
// basically controller.is.ready
// or controller.is.stopped etc
export function getControllerIsAttribute() {
  const currentState = this.getState();
  const members = {};
  this[ALL_STATES].reduce((acc, nextValue) => {
    acc[nextValue] = nextValue === currentState;
    return acc;
  }, members);
  return members;
}

export default class Machine {
  constructor(machineConfig) {
    const {
      name,
      allStates,
      initialState,
      initialValue,
      reducers,
      effects
    } = createMachineConfigWithDefaults(machineConfig);
    this[ALL_STATES] = allStates;
    this[INTERNAL_STATE] = initialState;
    this[INTERNAL_VALUE] = initialValue;
    this[REDUCERS] = reducers;
    this[EFFECTS] = effects;
    this[MACHINE_NAME] = name;
    this[LISTENERS] = [];
  }
  setState(nextState) {
    this[INTERNAL_STATE] = nextState;
    return nextState;
  }
  setValue(nextValue) {
    this[INTERNAL_VALUE] = nextValue;
    return nextValue;
  }
  getState() {
    return this[INTERNAL_STATE];
  }
  getValue() {
    return this[INTERNAL_VALUE];
  }
  getName() {
    return this[MACHINE_NAME];
  }
  getController() {
    return {
      value: this.getValue(),
      state: this.getState(),
      ...createControllerMembersFromReducers.call(this),
      ...createControllerMembersFromEffects.call(this),
      can: getReducerDispatchablities.call(this),
      is: getControllerIsAttribute.call(this)
    };
  }
  broadcast() {
    this[LISTENERS].forEach(listener => listener());
  }
  subscribe(fn) {
    this[LISTENERS] = [...this[LISTENERS], fn];
    return () => {
      this.unsubscribe(fn);
    };
  }
  unsubscribe(fn) {
    this[LISTENERS] = this[LISTENERS].filter(func => func !== fn);
  }
}


/**
 * createMachine - creates Machine and returns a Provider and Consumer
 *
 * @param  {type} machineConfig description
 * @return {type}               description
 */
export function createMachine(machineConfig) {
  const MachineContext = createReactContext(null);
  const machine = new Machine(machineConfig);
  class Provider extends React.Component {
    static propTypes = {
      children : PropTypes.any
    }
    constructor(props) {
      super(props);
      this.unsubscribe = machine.subscribe(() => {
        this.setState({
          value: machine.getController()
        });
      });
      this.state = {
        value: machine.getController()
      };
    }
    componentWillUnmount() {
      this.unsubscribe();
    }
    render() {
      return (
        <MachineContext.Provider value={this.state.value}>
          {this.props.children}
        </MachineContext.Provider>
      );
    }
  }

  class Consumer extends React.Component {
    static propTypes = {
      children : PropTypes.any
    }
    render() {
      return (
        <MachineContext.Consumer>
          {machineController => this.props.children(machineController)}
        </MachineContext.Consumer>
      );
    }
  }
  return {
    Provider,
    Consumer
  };
}
