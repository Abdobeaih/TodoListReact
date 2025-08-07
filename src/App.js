import "./App.css";
import TodoList from "./ComponentToDoList/TodoList"; // fixed file name case
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TodosProvider from "./Context/ToDosContext";
import { ToastProvider } from "./Context/ToastContext";

const theme = createTheme({
    typography: {
        fontFamily: ["Roboto", "Arial", "sans-serif"],
    },
    palette: {
        primary: {
            main: "#004d40",
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <TodosProvider>
                <ToastProvider>
                    <div
                        className="App"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh",
                            background: "#657dadff",
                        }}
                    >
                        <TodoList /> {/* fixed component name case */}
                    </div>
                </ToastProvider>
            </TodosProvider>
        </ThemeProvider>
    );
}

export default App;
