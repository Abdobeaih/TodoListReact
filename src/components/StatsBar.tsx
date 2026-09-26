import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import TimelapseRoundedIcon from "@mui/icons-material/TimelapseRounded";
import type { TaskStats } from "../lib/tasks";
import { STATUS_META, type TaskStatus } from "../types/task";

interface StatsBarProps {
    stats: TaskStats;
    activeStatuses: string[];
    overdueActive: boolean;
    dueTodayActive: boolean;
    onToggleStatus: (status: TaskStatus) => void;
    onToggleOverdue: () => void;
    onToggleDueToday: () => void;
}

interface StatTileProps {
    label: string;
    value: number;
    icon: ReactNode;
    active: boolean;
    tone?: "default" | "error" | "warning";
    onClick: () => void;
}

function StatTile({ label, value, icon, active, tone = "default", onClick }: StatTileProps) {
    const color = tone === "error" ? "error" : tone === "warning" ? "warning" : "primary";

    return (
        <Box
            component="button"
            type="button"
            onClick={onClick}
            aria-pressed={active}
            sx={{
                all: "unset",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.5,
                py: 1.25,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: active ? `${color}.main` : "var(--mui-palette-divider)",
                backgroundColor: active ? "action.selected" : "transparent",
                transition: "background-color 150ms ease, border-color 150ms ease",
                "&:hover": { backgroundColor: "action.hover" },
                "&:focus-visible": { outline: "2px solid", outlineColor: `${color}.main` },
            }}
        >
            <Box
                aria-hidden
                sx={{
                    display: "grid",
                    placeItems: "center",
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    color: `${color}.main`,
                    backgroundColor: "action.selected",
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ textAlign: "left", minWidth: 0 }}>
                <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
                    {value}
                </Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: "block" }}
                >
                    {label}
                </Typography>
            </Box>
        </Box>
    );
}

export function StatsBar({
    stats,
    activeStatuses,
    overdueActive,
    dueTodayActive,
    onToggleStatus,
    onToggleOverdue,
    onToggleDueToday,
}: StatsBarProps) {
    const open = stats.total - stats.done;

    return (
        <Card>
            <Stack spacing={0} sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="baseline"
                            spacing={2}
                        >
                            <Typography variant="subtitle2" color="text.secondary">
                                Overall progress
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stats.done} of {stats.total} done
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={stats.completionRate}
                            color="success"
                            aria-label="Task completion"
                            sx={{ mt: 1 }}
                        />
                    </Box>
                    <Stack direction="row" alignItems="baseline" spacing={1} sx={{ flexShrink: 0 }}>
                        <Typography variant="h2" color="primary.main">
                            {stats.completionRate}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {open} still open
                        </Typography>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={1.25}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatTile
                            label={STATUS_META.todo.label}
                            value={stats.todo}
                            icon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
                            active={activeStatuses.length === 1 && activeStatuses[0] === "todo"}
                            onClick={() => onToggleStatus("todo")}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatTile
                            label={STATUS_META.doing.label}
                            value={stats.doing}
                            icon={<TimelapseRoundedIcon fontSize="small" />}
                            active={activeStatuses.length === 1 && activeStatuses[0] === "doing"}
                            onClick={() => onToggleStatus("doing")}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatTile
                            label="Overdue"
                            value={stats.overdue}
                            tone={stats.overdue > 0 ? "error" : "default"}
                            icon={<ErrorOutlineRoundedIcon fontSize="small" />}
                            active={overdueActive}
                            onClick={onToggleOverdue}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <StatTile
                            label="Due today"
                            value={stats.dueToday}
                            tone={stats.dueToday > 0 ? "warning" : "default"}
                            icon={<EventRoundedIcon fontSize="small" />}
                            active={dueTodayActive}
                            onClick={onToggleDueToday}
                        />
                    </Grid>
                </Grid>
            </Stack>
        </Card>
    );
}
