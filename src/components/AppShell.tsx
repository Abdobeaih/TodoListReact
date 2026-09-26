import type { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { useColorScheme } from "@mui/material/styles";

export function AppShell({ children }: { children: ReactNode }) {
    const { mode, setMode } = useColorScheme();
    const isDark = mode === "dark";

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <AppBar
                position="sticky"
                elevation={0}
                color="transparent"
                sx={{
                    backdropFilter: "blur(12px)",
                    backgroundColor:
                        "color-mix(in srgb, var(--mui-palette-background-default) 82%, transparent)",
                    borderBottom: "1px solid var(--mui-palette-divider)",
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 60, sm: 72 }, gap: 2 }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ minWidth: 0 }}
                        >
                            <Box
                                aria-hidden
                                sx={{
                                    display: "grid",
                                    placeItems: "center",
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2.5,
                                    color: "primary.contrastText",
                                    background:
                                        "linear-gradient(135deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))",
                                    boxShadow: "0 6px 16px rgba(91, 84, 232, 0.35)",
                                    flexShrink: 0,
                                }}
                            >
                                <TaskAltRoundedIcon fontSize="small" />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h3" noWrap>
                                    TaskFlow
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ display: { xs: "none", sm: "block" } }}
                                >
                                    Plan, prioritise and finish what matters
                                </Typography>
                            </Box>
                        </Stack>

                        <Box sx={{ flex: 1 }} />

                        <Tooltip
                            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
                            enterTouchDelay={0}
                        >
                            <IconButton
                                onClick={() => setMode(isDark ? "light" : "dark")}
                                aria-label={
                                    isDark ? "Switch to light theme" : "Switch to dark theme"
                                }
                                sx={{ border: "1px solid var(--mui-palette-divider)" }}
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
                maxWidth="lg"
                component="main"
                sx={{ flex: 1, py: { xs: 2.5, sm: 4 }, display: "flex", flexDirection: "column" }}
            >
                {children}
            </Container>
        </Box>
    );
}
