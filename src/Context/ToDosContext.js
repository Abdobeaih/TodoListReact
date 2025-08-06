import { createContext, useReducer, useContext } from "react";
import todosReducer from '../Reducer/ReducerTodos';

export const TodosContext = createContext([]);
export const DispatchContext = createContext(null);

const TodosProvider = ({ children }) => {
  const [Todos, dispatch] = useReducer(todosReducer, []);

  return (
    <TodosContext.Provider value={Todos}>
      <DispatchContext.Provider value={dispatch}>

        {children}
      </DispatchContext.Provider>
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  return useContext(TodosContext);
};

export const useTodosDispatch = () => {
  return useContext(DispatchContext);
};

export default TodosProvider;
