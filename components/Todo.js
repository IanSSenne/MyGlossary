import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useFirebase } from "react-redux-firebase";
const styles = {
    container: {
        display: "flex",
        alignItems: "center",
        margin: "2rem",
        border: "1px solid grey"
    },
    owner: {
        fontSize: ".6rem"
    },
    meta: {
        display: "flex",
        flexDirection: "column"
    }
};

function Todo({ id }) {
    const todo = useSelector(state => state.firebase.data.todos[id]);
    const firebase = useFirebase();

    function toggleDone() {
        firebase.update(`todos/${id}`, { done: !todo.done });
    }
    function deleteTodo() {
        return firebase.remove(`todos/${id}`);
    }

    return (
        <li className="Todo" style={styles.container}>
            <input
                className="Todo-Input"
                type="checkbox"
                checked={todo.done}
                onChange={toggleDone}
            />
            {todo.text || todo.name}
            <button className="Todo-Button" onClick={deleteTodo}>
                Delete
      </button>
        </li>
    );
}

Todo.propTypes = {
    id: PropTypes.string.isRequired
};

export default Todo;
