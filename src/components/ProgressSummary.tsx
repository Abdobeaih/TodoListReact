import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { TaskStats } from "../lib/tasks";

interface ProgressSummaryProps {
    stats: TaskStats;
    overdueActive: boolean;
    dueTodayActive: boolean;
    onToggleOverdue: () => void;
    onToggleDueToday: () => void;
}

interface CountLinkProps {
    label: string;
    value: number;
    color: "error" | "warning";
    active: boolean;
    onClick: () => void;
}

/** A count that doubles as a filter, so the summary never becomes a read-only dashboard. */
function CountLink({ label, value, color, active, onClick }: CountLinkProps) {
    return (
        <Box
            component="button"
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className="meta-item"
            sx={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 0.4,
                font: "inherit",
                color: `${color}.main`,
                fontWeight: active ? 600 : 500,
                textDecoration: active ? "underline" : "none",
            }}
        >
            <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>
                {value}
            </Box>
            {label}
        </Box>
    );
}

/**
 * A single line of context plus a hairline progress bar. Deliberately not a row of tiles:
 * the numbers people act on (overdue, due today) are the only ones given any emphasis.
 */
export function ProgressSummary({
    stats,
    overdueActive,
    dueTodayActive,
    onToggleOverdue,
    onToggleDueToday,
}: ProgressSummaryProps) {
    if (stats.total === 0) return null;

    return (
        <Box sx={{ mb: 2 }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 0.75 }}
            >
                <Typography variant="caption" color="text.secondary">
                    {stats.done} of {stats.total} done
                </Typography>

                {(stats.overdue > 0 || stats.dueToday > 0) && (
                    <Stack direction="row" spacing={1.75} sx={{ fontSize: "0.75rem" }}>
                        {stats.overdue > 0 && (
                            <CountLink
                                label="overdue"
                                value={stats.overdue}
                                color="error"
                                active={overdueActive}
                                onClick={onToggleOverdue}
                            />
                        )}
                        {stats.dueToday > 0 && (
                            <CountLink
                                label="due today"
                                value={stats.dueToday}
                                color="warning"
                                active={dueTodayActive}
                                onClick={onToggleDueToday}
                            />
                        )}
                    </Stack>
                )}
            </Stack>

            <LinearProgress
                variant="determinate"
                value={stats.completionRate}
                color="success"
                aria-label="Task completion"
            />
        </Box>
    );
}
