
import './App.css';
import ToDoList from './ComponentToDoList/Todolist';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import TodosProvider from './Context/ToDosContext';
import { ToastProvider } from './Context/ToastContex';

const theme = createTheme({
  typography: {
    fontFamily: ["A"]
  },
  palette: {
    primary: {
      main: "#004d40"
    }
  }
});

const initialTodos = [
  {
    id: uuidv4(),
    title: "Read Book",
    details: "Tesla Electrical Book",
    Iscompleted: false
  },
  {
    id: uuidv4(),
    title: "WorkOut",
    details: "Go Gym",
    Iscompleted: false
  },
  {
    id: uuidv4(),
    title: "Learn English",
    details: "network",
    Iscompleted: false
  }
];

function App() {
 // eslint-disable-next-line no-unused-vars
  const [Todos, setTodos] = useState(initialTodos);

  return (
    <ThemeProvider theme={theme}>
      <TodosProvider>
        <ToastProvider>
          <div className="App" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "#657dadff"
          }}>
            <ToDoList />
          </div>
        </ToastProvider>
      </TodosProvider>
    </ThemeProvider>
  );
}

export default App;
