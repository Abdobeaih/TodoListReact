import type { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { useColorScheme } from "@mui/material/styles";
import { APP_BAR_HEIGHT } from "../theme/theme";

export function AppShell({ children }: { children: ReactNode }) {
    const { mode, setMode } = useColorScheme();
    const isDark = mode === "dark";
    const toggleLabel = isDark ? "Switch to light theme" : "Switch to dark theme";

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <AppBar
                position="sticky"
                elevation={0}
                color="transparent"
                sx={{
                    backgroundColor: "var(--mui-palette-background-default)",
                    borderBottom: "1px solid var(--mui-palette-divider)",
                }}
            >
                <Container maxWidth="md">
                    <Toolbar disableGutters sx={{ minHeight: APP_BAR_HEIGHT, gap: 1.5 }}>
                        <Box
                            aria-hidden
                            sx={{
                                display: "grid",
                                placeItems: "center",
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                color: "primary.contrastText",
                                backgroundColor: "primary.main",
                                flexShrink: 0,
                            }}
                        >
                            <TaskAltRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="h3" noWrap>
                            TaskFlow
                        </Typography>

                        <Box sx={{ flex: 1 }} />

                        <Tooltip title={toggleLabel} enterTouchDelay={0}>
                            <IconButton
                                onClick={() => setMode(isDark ? "light" : "dark")}
                                aria-label={toggleLabel}
                            >
                                {isDark ? (
                                    <LightModeRoundedIcon fontSize="small" />
                                ) : (
                                    <DarkModeRoundedIcon fontSize="small" />
                                )}
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container
                maxWidth="md"
                component="main"
                sx={{ flex: 1, py: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column" }}
            >
                {children}
            </Container>
        </Box>
    );
}
