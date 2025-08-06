import { v4 as uuidv4 } from "uuid";

const initialTodos = [
    {
        id: uuidv4(),
        title: "Read Book",
        details: "Tesla Electrical Book",
        Incomplete: false,
    },
    {
        id: uuidv4(),
        title: "WorkOut",
        details: "Go Gym",
        Incomplete: false,
    },
    {
        id: uuidv4(),
        title: "Learn English",
        details: "network",
        Incomplete: false,
    },
];

export default function reducer(CurrentTodos, action) {
    switch (action.type) {
        case "added": {
            const newTodo = {
                id: uuidv4(),
                title: action.payload.newTitle,
                details: "",
                Incomplete: false,
            };
            const UpdatedTodos = [...CurrentTodos, newTodo];
            localStorage.setItem("todos", JSON.stringify(UpdatedTodos));
            return UpdatedTodos;
        }
        case "deleted": {
            const UpdatedTodos = CurrentTodos.filter((D) => {
                return D.id !== action.payload.id;
            });
            localStorage.setItem("todos", JSON.stringify(UpdatedTodos));
            return UpdatedTodos;
        }
        case "Update": {
            const updatedTodos = CurrentTodos.map((D) => {
                if (D.id === action.payload.id) {
                    return {
                        ...D,
                        title: action.payload.title,
                        details: action.payload.details,
                    };
                } else {
                    return D;
                }
            });
            localStorage.setItem("todos", JSON.stringify(updatedTodos));
            return updatedTodos;
        }
        case "get": {
            const StorageTodos =
                JSON.parse(localStorage.getItem("todos")) || initialTodos;
            return StorageTodos;
        }
        case "completed": {
            const updatedTodos = CurrentTodos.map((D) => {
                if (D.id === action.payload.id) {
                    const updatedTodos = {
                        ...D,
                        Incomplete: !D.Incomplete,
                    };
                    return updatedTodos;
                }
                return D;
            });
            localStorage.setItem("todos", JSON.stringify(updatedTodos));
            return updatedTodos;
        }
        default: {
            return CurrentTodos;
        }
    }
}
