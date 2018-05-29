<p align="center">
  
<img src="https://github.com/imbhargav5/armin/blob/master/.github/armin_logo.png"/>
</p>

<p align="center"> Declarative state machines for React! </p>

<hr/>
<p align="center">
React Component state is a powerful way of managing state within a component, but can we do more? Can we create and maintain state which is more readable and self-explantory and powerful at the same time? 
 </p>

<hr/>


## Quick Example

```javascript
import {createMachine} from "armin"

const ViewToggler = createMachine({
  allStates: ["visible", "hidden"], 
  state : "visible",
  reducers : {
    hide : {
      from : ["visible"],
      setState : () => "hidden"
    },
    show : {
      from : ["hidden"],
      setState : () => "visible"
    }
  }
})

// In your component's render method

<ViewToggler.Provider>
   ...
      <ViewToggler.Consumer>
        {toggler => <>
            <button disabled={toggler.is.visible} onClick={toggler.show} > Show </button>
            <button disabled={toggler.is.hidden} onClick={toggler.hide} > Hide </button>
        </>}
      </ViewToggler.Consumer>
   ...    
</ViewToggler.Provider>

```


## Motivation

Let's compare these two examples.

```javascript
<button 
  disabled={counter.can.decrement && counter.is.started} 
  onClick={counter.increment}> 
    Delete 
 </button>
```

vs 

```javascript
<button 
   disabled={counter.value > 0 && counter.value < counter.MAX_VALUE} 
   onClick={counter.increment} > 
    Decrement 
</button>
```

The first one is extremely readable and you can immeditately tell what the developer is trying to do in this code. It hardly requires comments. That is the motivation for this project. 
State machines in Arminjs with meaningful names for states have great potential to make developer experience great for building applications with React.


## Features : 

  - State machine creation is similar to the api of <a href="https://github.com/rematch/rematch">Rematch</a>
  - Uses the new 16.3 React Context API for data flow across components
  - Async actions are supported
  - Multiple state machines are supported but you can subscribe to only the ones you need
    within a component
 

## Examples

Let's see how we can build a counter with Arminjs.


### Single State Machine -> An async counter example with armin

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


### Multiple state machines

Just like above, but we can create multiple machines at once and then subscribe to only the ones we need to ensure maximum performance during rerenders on update.

```javascript

import {init} from "armin"

// create a an object with state machine config as above
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
}

const counter = {
  ...
}

const user = {
  ...
}

const { store, Provider, createConsumer } = init({
  toggler,
  counter,
  user
});

const Consumer = createConsumer(["toggler","counter"]);

class MyChildComponent extends Component{
  render(){
    return <Consumer>
      {([toggler,counter]) => <button isDisabled={toggler.is.hidden} onClick={counter.increment}>{counter.value}</button>}
    </Consumer>
  }
}


class MyRootComponent extends Component{
   render(){
      return <Provider>
         <MyChildComponent/>
      </Provider>
   }
}


```


### License

MIT


