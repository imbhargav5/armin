# armin

Declarative state machines for React!

React Component state is a powerful way of managing state within a component, but can we do more? Can we create and maintain state which is more readable and self-explantory and powerful at the same time? 


### An async counter example with armin

1. Create a machine

```javascript
import {createMachine} from "armin"

const { Provider, Consumer } = createMachine({
  allStates: ["ready", "running", "stopped"],
  state: "ready",
  value: 0,
  reducers: {
    increment: {
      setValue: ({ value, state }, payload = 1) => value + payload,
      setState: () => "running"
    },
    decrement: {
      from: ["running"],
      setValue: ({ value, state }, payload = 1) => value - payload,
      setState: (opts, setValue) =>
        setValue <= 0 ? "stopped" : "running"
    },
    stop: {
      from: ["ready", "running"],
      setValue: ({ value }) => value,
      setState: () => "stopped"
    }
  },
  effects: {
    async incrementAsync() {
      console.log("waiting");
      await new Promise(resolve =>
        setTimeout(() => {
          console.log("done waiting");
          resolve();
        }, 1000)
      );
      this.increment(5);
    }
  }
});

```

2. Using the machine inside React 

```javascript
<Provider>
        <Consumer>
          {machineController => {
            console.log(machineController);
            return (
              <div>
                <p>
                  <button
                    disabled={!machineController.can.increment}
                    onClick={e => machineController.increment(2)}
                  >
                    Increment By 2
                  </button>
                </p>
                <p>Value is {machineController.value}</p>
                <p>
                  <button
                    disabled={!machineController.can.decrement}
                    onClick={() => machineController.decrement(1)}
                  >
                    Decrement
                  </button>
                </p>
                <p>
                  <button
                    disabled={!machineController.can.increment}
                    onClick={e => machineController.incrementAsync()}
                  >
                    Wait for a second and increment by 5
                  </button>
                </p>
                <p>
                  <button
                    disabled={!machineController.can.stop}
                    onClick={() => machineController.stop()}
                  >
                    Stop counter
                  </button>
                </p>
              </div>
            );
          }}
        </Consumer>
      </Provider>

```


