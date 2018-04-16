import React, {Component} from "react";
import { render } from "react-dom";
import { init } from "../src/armin";

const toggler = {
  allStates: ["showing", "hiding"],
  state: "hiding",
  reducers: {
    show: {
      from: ["hiding"],
      setState: () => "showing"
    },
    hide: {
      from: ["showing"],
      setState: () => "hiding"
    }
  }
};

const counter = {
  allStates: ["ready", "running", "stopped"],
  state: "ready",
  value: 0,
  reducers: {
    increment: {
      from: ["ready", "running"],
      setState: () => "running",
      setValue: ({ value }) => value + 1
    },
    stop: {
      from: ["ready", "running"],
      setState: () => "stopped"
    },
    restart: {
      from: ["stopped"],
      setState: () => "ready",
      setValue: ({ value }) => 0
    }
  },
  effects: {
    incrementAsync() {
      return setInterval(() => {
        this.increment();
      }, 100);
    }
  }
};

const { store, Provider, createConsumer } = init({
  toggler,
  counter
});

class Counter extends React.Component {
  timers = [];
  startIncrementAsync = () => {
    this.timers.push(this.props.counter.incrementAsync());
  };

  stop = () => {
    this.timers.forEach(timer => clearInterval(timer));
    this.timers = [];
    this.props.counter.stop();
  };

  render() {
    const { counter } = this.props;
    return (
      <div>
        <p>
          {" "}
          <button disabled={!counter.can.increment} onClick={counter.increment}>
            Increment
          </button>{" "}
          <button
            disabled={!counter.can.increment}
            onClick={this.startIncrementAsync}
          >
            Increment every 100s
          </button>{" "}
        </p>
        <p> {counter.value} </p>
        <p>
          {" "}
          <button disabled={!counter.can.restart} onClick={counter.restart}>
            Restart
          </button>{" "}
          <button disabled={!counter.can.stop} onClick={this.stop}>
            Stop
          </button>{" "}
        </p>
      </div>
    );
  }
}

const Consumer = createConsumer(["toggler", "counter"]);

export default class Home extends React.Component {
  render() {
    return (
      <Provider>
        <Consumer>
          {([toggler, counter]) => {
            return (
              <div>
                <p>State {toggler.state}</p>
                <p>Value {toggler.value}</p>
                <p>
                  <button disabled={!toggler.can.show} onClick={toggler.show}>
                    Show
                  </button>
                  <button disabled={!toggler.can.hide} onClick={toggler.hide}>
                    Hide
                  </button>
                </p>
                <hr />
                <Counter counter={counter} />
              </div>
            );
          }}
        </Consumer>
      </Provider>
    );
  }
}

render(<Home />, window.store);
