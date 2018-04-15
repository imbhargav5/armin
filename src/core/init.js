import React from "react";
import PropTypes from "prop-types";
import createReactContext from "create-react-context";
import Store from "./Store";

export default function init(storeConfig) {
  const StoreContext = createReactContext(null);
  const store = new Store(storeConfig);

  class Provider extends React.Component {
    static propTypes = {
      children : PropTypes.any
    }
    state = {
      value: store
    };
    render() {
      return (
        <StoreContext.Provider value={this.state.value}>
          {this.props.children}
        </StoreContext.Provider>
      );
    }
  }

  function createConsumer(to) {
    const DUMMY_STATE = {};
    return class Consumer extends React.Component {
      static propTypes = {
        children : PropTypes.any
      }
      subscriptions = [];
      onUpdate = cb => {
        this.setState(DUMMY_STATE, cb);
      };
      unsubscribe = () => {
        this.subscriptions.forEach(subscription => subscription());
      };
      subscribe = machines => {
        this.unsubscribe();
        this.subscriptions = machines.map(machine =>
          machine.subscribe(this.onUpdate)
        );
      };
      componentWillUnmount() {
        this.unsubscribe();
      }
      render() {
        return (
          <StoreContext.Consumer>
            {store => {
              const machines = store.getMachinesFromMachineNames(to);
              this.subscribe(machines);
              const machineControllers = machines.map(machine =>
                machine.getController()
              );
              return this.props.children(machineControllers);
            }}
          </StoreContext.Consumer>
        );
      }
    };
  }

  return {
    store,
    createConsumer,
    Provider
  };
}
