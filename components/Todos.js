import React from "react";
import { useSelector } from "react-redux";
import { useFirebaseConnect, isLoaded, isEmpty } from "react-redux-firebase";
import TodoItem from "./Todo";
import NewTodo from "./NewTodo";

const todosQuery = {
    path: "todos",
    queryParams: ["limitToLast=10"]
};

function Todos() {
    // Attach todos listener
    useFirebaseConnect(() => [todosQuery]);

    // Get todos from redux state
    const todos = useSelector(state => state.firebase.ordered.todos);

    // Show a message while todos are loading
    if (!isLoaded(todos)) {
        return "Loading";
    }

    // Show a message if there are no todos
    if (isEmpty(todos)) {
        return "Todo list is empty";
    }

    return <div>
        <ol>
            {todos
                .reverse()
                .map(({ value: todo, key }, ind) => (
                    <TodoItem key={`${key}-${ind}`} id={key} {...todo} />
                ))}
        </ol>
        <NewTodo></NewTodo>
    </div>
}

export default Todos;
