import { useState, type MouseEvent, type ReactNode } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { describeDueDate, formatFullDate } from "../lib/date";
import {
    DEFAULT_PROJECT,
    PRIORITY_META,
    PRIORITY_OPTIONS,
    STATUS_META,
    STATUS_OPTIONS,
    type Task,
    type TaskPriority,
    type TaskStatus,
} from "../types/task";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: "text.disabled",
    medium: "text.secondary",
    high: "warning.main",
    urgent: "error.main",
};

interface TaskItemProps {
    task: Task;
    onToggleComplete: (task: Task) => void;
    onSetStatus: (task: Task, status: TaskStatus) => void;
    onSetPriority: (task: Task, priority: TaskPriority) => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onFilterByProject: (project: string) => void;
    onFilterByTag: (tag: string) => void;
}

export function TaskItem({
    task,
    onToggleComplete,
    onSetStatus,
    onSetPriority,
    onEdit,
    onDelete,
    onFilterByProject,
    onFilterByTag,
}: TaskItemProps) {
    const [actionsAnchor, setActionsAnchor] = useState<HTMLElement | null>(null);
    const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
    const [priorityAnchor, setPriorityAnchor] = useState<HTMLElement | null>(null);

    const isDone = task.status === "done";
    const isDoing = task.status === "doing";
    const due = describeDueDate(task.dueDate);
    const priorityColor = PRIORITY_COLORS[task.priority];

    // Colour is reserved for the two facts a user must act on: overdue, and due today.
    // Completed work never nags, even when it was finished after the deadline.
    const dueColor = isDone
        ? null
        : due.tone === "overdue"
          ? "error.main"
          : due.tone === "today"
            ? "warning.main"
            : null;

    const meta: ReactNode[] = [];
    const addMeta = (node: ReactNode) => {
        if (node) meta.push(node);
    };

    addMeta(
        <Tooltip key="priority" title="Change priority">
            <Box
                component="button"
                type="button"
                onClick={(event: MouseEvent<HTMLElement>) => setPriorityAnchor(event.currentTarget)}
                aria-haspopup="menu"
                aria-label={`Change priority of "${task.title}"`}
                className="meta-item"
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.4,
                    color: priorityColor,
                }}
            >
                <FlagOutlinedIcon sx={{ fontSize: 12 }} />
                {PRIORITY_META[task.priority].label}
            </Box>
        </Tooltip>,
    );

    if (task.project !== DEFAULT_PROJECT) {
        addMeta(
            <Box
                key="project"
                component="button"
                type="button"
                className="meta-item"
                onClick={() => onFilterByProject(task.project)}
            >
                {task.project}
            </Box>,
        );
    }

    for (const tag of task.tags) {
        addMeta(
            <Box
                key={`tag-${tag}`}
                component="button"
                type="button"
                className="meta-item"
                onClick={() => onFilterByTag(tag)}
            >
                #{tag}
            </Box>,
        );
    }

    if (task.dueDate) {
        addMeta(
            <Tooltip key="due" title={formatFullDate(task.dueDate)}>
                <Box
                    component="span"
                    className="meta-item"
                    sx={{ color: dueColor, fontWeight: dueColor ? 600 : 400 }}
                >
                    {due.label}
                </Box>
            </Tooltip>,
        );
    }

    if (isDoing) {
        addMeta(
            <Box
                key="status"
                component="button"
                type="button"
                className="meta-item"
                aria-haspopup="menu"
                onClick={(event: MouseEvent<HTMLElement>) => setStatusAnchor(event.currentTarget)}
                sx={{ color: "info.main" }}
            >
                {STATUS_META.doing.short}
            </Box>,
        );
    }

    return (
        <Box
            component="li"
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                py: 1,
                pl: 0.5,
                pr: 0.5,
                borderBottom: "1px solid var(--mui-palette-divider)",
                transition: "background-color 120ms ease",
                "&:hover": { backgroundColor: "action.hover" },
                "&:last-of-type": { borderBottom: "none" },
                // Reveal the row actions from the row, not from the actions themselves.
                "&:hover .row-actions, &:focus-within .row-actions": { opacity: 1 },
            }}
        >
            <CompleteToggle
                task={task}
                isDone={isDone}
                isDoing={isDoing}
                onToggle={onToggleComplete}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    sx={{
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        lineHeight: 1.45,
                        color: isDone ? "text.secondary" : "text.primary",
                        textDecoration: isDone ? "line-through" : "none",
                        overflowWrap: "anywhere",
                    }}
                >
                    {task.title}
                </Typography>

                {task.notes && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.15,
                            overflowWrap: "anywhere",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {task.notes}
                    </Typography>
                )}

                {meta.length > 0 && (
                    <Stack
                        direction="row"
                        spacing={0.75}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="center"
                        sx={{ mt: 0.4, fontSize: "0.75rem", color: "text.secondary" }}
                    >
                        {meta.map((node, index) => (
                            <Box key={index} className="meta-sep" sx={{ display: "contents" }}>
                                {index > 0 && (
                                    <Box aria-hidden sx={{ color: "text.disabled" }}>
                                        ·
                                    </Box>
                                )}
                                {node}
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            <Box
                className="row-actions"
                sx={{
                    flexShrink: 0,
                    display: "flex",
                    gap: 0.25,
                    // Quiet by default on pointer devices; always visible where there is no hover.
                    opacity: { xs: 1, sm: 0 },
                    transition: "opacity 120ms ease",
                    "@media (hover: none)": { opacity: 1 },
                }}
            >
                <Tooltip title="Edit task">
                    <IconButton
                        aria-label={`Edit "${task.title}"`}
                        onClick={() => onEdit(task)}
                        size="small"
                    >
                        <EditRoundedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="More actions">
                    <IconButton
                        aria-label={`More actions for "${task.title}"`}
                        aria-haspopup="menu"
                        onClick={(event) => setActionsAnchor(event.currentTarget)}
                        size="small"
                    >
                        <MoreHorizRoundedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Menu
                anchorEl={actionsAnchor}
                open={Boolean(actionsAnchor)}
                onClose={() => setActionsAnchor(null)}
                onClick={() => setActionsAnchor(null)}
            >
                <MenuItem onClick={() => onEdit(task)}>
                    <ListItemIcon>
                        <EditRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={(event) => setStatusAnchor(event.currentTarget)}
                    sx={{ display: { xs: "none", sm: "flex" } }}
                >
                    <ListItemIcon>
                        <Box
                            aria-hidden
                            sx={{
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                border: "1.5px solid currentColor",
                            }}
                        />
                    </ListItemIcon>
                    <ListItemText>Change status</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => onDelete(task)} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                        <DeleteOutlineRoundedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            <Menu
                anchorEl={statusAnchor}
                open={Boolean(statusAnchor)}
                onClose={() => setStatusAnchor(null)}
            >
                {STATUS_OPTIONS.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => onSetStatus(task, option.value)}
                        selected={task.status === option.value}
                    >
                        <ListItemIcon>
                            {task.status === option.value ? (
                                <CheckRoundedIcon fontSize="small" />
                            ) : (
                                <Box sx={{ width: 20 }} />
                            )}
                        </ListItemIcon>
                        <ListItemText>{option.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>

            <Menu
                anchorEl={priorityAnchor}
                open={Boolean(priorityAnchor)}
                onClose={() => setPriorityAnchor(null)}
            >
                {PRIORITY_OPTIONS.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => onSetPriority(task, option.value)}
                        selected={task.priority === option.value}
                    >
                        <ListItemIcon>
                            {task.priority === option.value ? (
                                <CheckRoundedIcon fontSize="small" />
                            ) : (
                                <Box sx={{ width: 20 }} />
                            )}
                        </ListItemIcon>
                        <ListItemText>{option.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}

interface CompleteToggleProps {
    task: Task;
    isDone: boolean;
    isDoing: boolean;
    onToggle: (task: Task) => void;
}

/**
 * A round two-state control rather than a three-way status cycle: completing a task is the
 * one action people perform hundreds of times, and it should never be a mis-click.
 */
function CompleteToggle({ task, isDone, isDoing, onToggle }: CompleteToggleProps) {
    const label = isDone
        ? `Mark "${task.title}" as not completed`
        : `Mark "${task.title}" as completed`;

    return (
        <ButtonBase
            role="checkbox"
            aria-checked={isDone}
            aria-label={label}
            onClick={() => onToggle(task)}
            disableRipple
            sx={{
                mt: "3px",
                width: 20,
                height: 20,
                flexShrink: 0,
                borderRadius: "50%",
                border: "1.5px solid",
                borderColor: isDone ? "success.main" : isDoing ? "info.main" : "divider",
                backgroundColor: isDone ? "success.main" : "transparent",
                transition: "border-color 120ms ease, background-color 120ms ease",
                "&:hover": {
                    borderColor: isDone ? "success.dark" : "text.secondary",
                    backgroundColor: isDone ? "success.dark" : "action.hover",
                },
                "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: 2,
                },
            }}
        >
            {isDone ? (
                <CheckRoundedIcon sx={{ fontSize: 14, color: "#fff" }} />
            ) : isDoing ? (
                <Box
                    aria-hidden
                    sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "info.main" }}
                />
            ) : null}
        </ButtonBase>
    );
}
