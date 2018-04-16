import React, { Component } from "react";
import { render } from "react-dom";
import { createMachine } from "../src/armin";

const { Provider, Consumer } = createMachine({
  allStates: ["ready", "editing"],
  state: "ready",
  value: {
    list: [
      {
        text: "Finish visa process",
        isCompleted: false
      }
    ],
    editingTodoId: null
  },
  reducers: {
    editTodo: {
      from: ["ready"],
      setState: () => "editing"
    },
    finishEditing: {
      from: ["editing"],
      setState: () => "ready"
    },
    toggleIsCompleted: {
      setValue: ({ value }, index, isCompleted) => ({
        ...value,
        list: [
          ...value.list.slice(0, index),
          {
            ...value.list[index],
            isCompleted
          },
          ...value.list.slice(index + 1)
        ]
      })
    },
    addTodo: {
      setValue: ({ value }, { text, isCompleted }) => {
        return {
          ...value,
          list: [...value.list, { text, isCompleted }]
        };
      }
    }
  }
});

class TodoForm extends Component {
  state = {
    text: "",
    isCompleted: false
  };
  handleSubmit = e => {
    e.preventDefault();
    if (this.state.text) {
      this.props.onSubmit({
        text: this.state.text,
        isCompleted: this.state.isCompleted
      });
      this.setState({
        text: "",
        isCompleted: false
      });
    }
  };
  changeText = e => this.setState({ text: e.target.value });
  changeIsCompleted = e => this.setState({ isCompleted: e.target.checked });
  render() {
    const { canSubmit } = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="checkbox"
          disabled={!canSubmit}
          checked={this.state.isCompleted}
          onChange={this.changeIsCompleted}
        />
        <input
          value={this.state.text}
          disabled={!canSubmit}
          onChange={this.changeText}
        />
        <button type="submit" disabled={!canSubmit}>
          Submit
        </button>
      </form>
    );
  }
}

class DisplayTodo extends Component {
  changeIsCompleted = e => {
    this.props.onToggleIsCompleted(this.props.index, e.target.checked);
  };
  render() {
    const { canToggleIsCompleted, todo } = this.props;
    return (
      <p>
        <input
          type="checkbox"
          disabled={!canToggleIsCompleted}
          checked={todo.isCompleted}
          onChange={this.changeIsCompleted}
        />
        <span>{todo.text}</span>
      </p>
    );
  }
}

export default class Todos extends Component {
  attemptAddTodo = fn => e => {
    e.preventDefault();
  };
  render() {
    return (
      <Provider>
        <Consumer>
          {todosController => {
            console.log(todosController);
            return (
              <div>
                {todosController.value.list.map((todo, index) => (
                  <DisplayTodo
                    key={index}
                    canToggleIsCompleted={todosController.can.toggleIsCompleted}
                    onToggleIsCompleted={todosController.toggleIsCompleted}
                    index={index}
                    todo={todo}
                  />
                ))}
                <TodoForm
                  onSubmit={todosController.addTodo}
                  canSubmit={todosController.can.addTodo}
                />
              </div>
            );
          }}
        </Consumer>
      </Provider>
    );
  }
}
render(<Todos />, window.todos);
