import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AppShell } from "./components/AppShell";
import { FeedbackProvider } from "./components/FeedbackProvider";
import { TaskDashboard } from "./components/TaskDashboard";
import { TaskProvider } from "./store/TaskProvider";
import { MODE_STORAGE_KEY, theme } from "./theme/theme";

export default function App() {
    return (
        <ThemeProvider theme={theme} defaultMode="system" modeStorageKey={MODE_STORAGE_KEY}>
            <CssBaseline />
            <FeedbackProvider>
                <TaskProvider>
                    <AppShell>
                        <TaskDashboard />
                    </AppShell>
                </TaskProvider>
            </FeedbackProvider>
        </ThemeProvider>
    );
}
