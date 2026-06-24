import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme, Container } from "@mui/material";
import ToDosContextProvider from "./Context/ToDosContext";
import { ToastProvider as ToastContextProvider } from "./Context/ToastContext";
import Todolist from "./ComponentToDoList/Todolist";

const theme = createTheme({
    typography: { fontFamily: "Poppins, sans-serif" },
});

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastContextProvider>
                <ToDosContextProvider>
                    <Container maxWidth="md" sx={{ mt: 4 }}>
                        <Todolist />
                    </Container>
                </ToDosContextProvider>
            </ToastContextProvider>
        </ThemeProvider>
    );
}
