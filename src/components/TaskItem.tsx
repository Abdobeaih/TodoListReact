import { useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import TimelapseRoundedIcon from "@mui/icons-material/TimelapseRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { describeDueDate, formatFullDate } from "../lib/date";
import { isOverdue, nextStatus } from "../lib/tasks";
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

const STATUS_ICONS: Record<TaskStatus, ReactNode> = {
    todo: <RadioButtonUncheckedRoundedIcon />,
    doing: <TimelapseRoundedIcon />,
    done: <CheckCircleRoundedIcon />,
};

const STATUS_COLORS: Record<TaskStatus, "default" | "info" | "success"> = {
    todo: "default",
    doing: "info",
    done: "success",
};

interface TaskItemProps {
    task: Task;
    onCycleStatus: (task: Task) => void;
    onSetStatus: (task: Task, status: TaskStatus) => void;
    onSetPriority: (task: Task, priority: TaskPriority) => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onFilterByProject: (project: string) => void;
    onFilterByTag: (tag: string) => void;
}

export function TaskItem({
    task,
    onCycleStatus,
    onSetStatus,
    onSetPriority,
    onEdit,
    onDelete,
    onFilterByProject,
    onFilterByTag,
}: TaskItemProps) {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [priorityAnchor, setPriorityAnchor] = useState<HTMLElement | null>(null);

    const isDone = task.status === "done";
    const upcoming = nextStatus(task.status);
    const due = describeDueDate(task.dueDate);
    const overdue = isOverdue(task);
    const dueColor =
        due.tone === "overdue"
            ? "error"
            : due.tone === "today"
              ? "warning"
              : due.tone === "soon"
                ? "info"
                : "default";
    const priorityMeta = PRIORITY_META[task.priority];

    return (
        <Card
            component="li"
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: { xs: 0.5, sm: 1 },
                p: { xs: 1, sm: 1.25 },
                pl: { xs: 1, sm: 1.5 },
                borderLeft: "3px solid",
                borderLeftColor: overdue ? "error.main" : "transparent",
                opacity: isDone ? 0.72 : 1,
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                "&:hover": { boxShadow: "0 6px 18px rgba(16, 18, 40, 0.08)" },
            }}
        >
            <Tooltip
                title={`${STATUS_META[task.status].label} · click to mark ${STATUS_META[upcoming].label.toLowerCase()}`}
            >
                <IconButton
                    aria-label={`Mark "${task.title}" as ${STATUS_META[upcoming].label}`}
                    onClick={() => onCycleStatus(task)}
                    color={STATUS_COLORS[task.status]}
                    sx={{ mt: 0.25, flexShrink: 0 }}
                >
                    {STATUS_ICONS[task.status]}
                </IconButton>
            </Tooltip>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="h5"
                    sx={{
                        textDecoration: isDone ? "line-through" : "none",
                        color: isDone ? "text.secondary" : "text.primary",
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
                            mt: 0.25,
                            overflowWrap: "anywhere",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {task.notes}
                    </Typography>
                )}

                <Stack
                    direction="row"
                    spacing={0.75}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: task.notes ? 1 : 0.75 }}
                >
                    <Chip
                        size="small"
                        label={priorityMeta.label}
                        color={priorityMeta.color}
                        variant="outlined"
                        icon={<SellRoundedIcon />}
                    />

                    {task.project !== DEFAULT_PROJECT && (
                        <Chip
                            size="small"
                            label={task.project}
                            variant="outlined"
                            icon={<FolderRoundedIcon />}
                            clickable
                            onClick={() => onFilterByProject(task.project)}
                        />
                    )}

                    {task.dueDate && (
                        <Tooltip title={formatFullDate(task.dueDate)}>
                            <Chip
                                size="small"
                                label={due.label}
                                color={dueColor}
                                variant={due.tone === "later" ? "outlined" : "filled"}
                                icon={<EventRoundedIcon />}
                            />
                        </Tooltip>
                    )}

                    {task.tags.map((tag) => (
                        <Chip
                            key={tag}
                            size="small"
                            label={`#${tag}`}
                            variant="outlined"
                            clickable
                            onClick={() => onFilterByTag(tag)}
                        />
                    ))}
                </Stack>
            </Box>

            <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
                <Tooltip title="Change priority">
                    <IconButton
                        aria-label={`Change priority of "${task.title}"`}
                        aria-haspopup="menu"
                        onClick={(event) => setPriorityAnchor(event.currentTarget)}
                        size="small"
                        sx={{
                            display: { xs: "none", sm: "inline-flex" },
                            color: task.priority === "low" ? "text.secondary" : priorityMeta.color,
                        }}
                    >
                        <TuneRoundedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Edit task">
                    <IconButton
                        aria-label={`Edit "${task.title}"`}
                        onClick={() => onEdit(task)}
                        size="small"
                        sx={{ display: { xs: "none", sm: "inline-flex" } }}
                    >
                        <EditRoundedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="More actions">
                    <IconButton
                        aria-label={`More actions for "${task.title}"`}
                        aria-haspopup="menu"
                        onClick={(event) => setMenuAnchor(event.currentTarget)}
                        size="small"
                    >
                        <MoreHorizRoundedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                onClick={() => setMenuAnchor(null)}
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
                        <ListItemText>{`Mark as ${option.label.toLowerCase()}`}</ListItemText>
                    </MenuItem>
                ))}
                <MenuItem onClick={() => onEdit(task)} sx={{ display: { xs: "flex", sm: "none" } }}>
                    <ListItemIcon>
                        <EditRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => onDelete(task)} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                        <DeleteOutlineRoundedIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            <Menu
                anchorEl={priorityAnchor}
                open={Boolean(priorityAnchor)}
                onClose={() => setPriorityAnchor(null)}
                onClick={() => setPriorityAnchor(null)}
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
        </Card>
    );
}
