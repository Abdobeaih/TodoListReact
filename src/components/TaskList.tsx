import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import type { DueGroup } from "../lib/tasks";
import type { Task, TaskPriority, TaskStatus } from "../types/task";
import { APP_BAR_HEIGHT } from "../theme/theme";
import { EmptyState } from "./EmptyState";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
    /** Visible tasks in sort order; used for the flat fallback and the result count. */
    tasks: Task[];
    groups: DueGroup[];
    grouped: boolean;
    totalCount: number;
    filtersActive: boolean;
    onToggleComplete: (task: Task) => void;
    onSetStatus: (task: Task, status: TaskStatus) => void;
    onSetPriority: (task: Task, priority: TaskPriority) => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onFilterByProject: (project: string) => void;
    onFilterByTag: (tag: string) => void;
    onClearFilters: () => void;
    onCreateFirst: () => void;
    onClearCompleted: () => void;
}

export function TaskList({
    tasks,
    groups,
    grouped,
    totalCount,
    filtersActive,
    onToggleComplete,
    onSetStatus,
    onSetPriority,
    onEdit,
    onDelete,
    onFilterByProject,
    onFilterByTag,
    onClearFilters,
    onCreateFirst,
    onClearCompleted,
}: TaskListProps) {
    // Expanded by default: collapsing finished work is a personal choice, and forcing it
    // would make an undone delete look like the task had vanished for good.
    const [completedOpen, setCompletedOpen] = useState(true);
    const hasCompleted = tasks.some((task) => task.status === "done");

    return (
        <Box component="section" aria-label="Tasks">
            {totalCount > 0 && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mb: 1 }}
                >
                    <Typography variant="body2" color="text.secondary" aria-live="polite">
                        {tasks.length === totalCount
                            ? `${totalCount} ${totalCount === 1 ? "task" : "tasks"}`
                            : `${tasks.length} of ${totalCount} tasks`}
                    </Typography>
                    {hasCompleted && (
                        <Button size="small" color="inherit" onClick={onClearCompleted}>
                            Clear completed
                        </Button>
                    )}
                </Stack>
            )}

            {tasks.length === 0 ? (
                totalCount === 0 ? (
                    <EmptyState
                        icon={<InboxRoundedIcon fontSize="small" />}
                        title="No tasks yet"
                        description="Add your first task to get started. Press N any time to add another."
                        action={
                            <Button variant="contained" onClick={onCreateFirst}>
                                Add your first task
                            </Button>
                        }
                    />
                ) : (
                    <EmptyState
                        icon={<SearchOffRoundedIcon fontSize="small" />}
                        title="No tasks match your filters"
                        description="Try a different search term, or reset the filters to see everything again."
                        action={
                            filtersActive ? (
                                <Button variant="outlined" onClick={onClearFilters}>
                                    Clear filters
                                </Button>
                            ) : undefined
                        }
                    />
                )
            ) : grouped ? (
                <Stack spacing={2.5} sx={{ m: 0, p: 0, listStyle: "none" }}>
                    {groups.map((group) => {
                        const collapsible = group.id === "completed";
                        const expanded = !collapsible || completedOpen;

                        return (
                            <Box key={group.id} component="section" aria-label={group.label}>
                                <GroupHeader
                                    group={group}
                                    collapsible={collapsible}
                                    expanded={expanded}
                                    onToggle={() => setCompletedOpen((open) => !open)}
                                />

                                <Collapse in={expanded} unmountOnExit>
                                    <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
                                        {group.tasks.map((task) => (
                                            <TaskItem
                                                key={task.id}
                                                task={task}
                                                onToggleComplete={onToggleComplete}
                                                onSetStatus={onSetStatus}
                                                onSetPriority={onSetPriority}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onFilterByProject={onFilterByProject}
                                                onFilterByTag={onFilterByTag}
                                            />
                                        ))}
                                    </Box>
                                </Collapse>
                            </Box>
                        );
                    })}
                </Stack>
            ) : (
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={onToggleComplete}
                            onSetStatus={onSetStatus}
                            onSetPriority={onSetPriority}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onFilterByProject={onFilterByProject}
                            onFilterByTag={onFilterByTag}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}

interface GroupHeaderProps {
    group: DueGroup;
    collapsible: boolean;
    expanded: boolean;
    onToggle: () => void;
}

function GroupHeader({ group, collapsible, expanded, onToggle }: GroupHeaderProps) {
    const content = (
        <>
            <Typography
                variant="overline"
                color={group.id === "overdue" ? "error.main" : "text.secondary"}
            >
                {group.label}
            </Typography>
            <Typography variant="caption" color="text.disabled">
                {group.tasks.length}
            </Typography>
        </>
    );

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
                // Sticks directly beneath the app bar so the section stays in view while scrolling.
                position: "sticky",
                top: APP_BAR_HEIGHT,
                zIndex: 1,
                py: 0.75,
                pr: 0.5,
                backgroundColor: "var(--mui-palette-background-default)",
                borderBottom: "1px solid var(--mui-palette-divider)",
            }}
        >
            {collapsible ? (
                <Box
                    component="button"
                    type="button"
                    onClick={onToggle}
                    aria-expanded={expanded}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        font: "inherit",
                        color: "inherit",
                        background: "none",
                        border: 0,
                        p: 0,
                        cursor: "pointer",
                    }}
                >
                    {content}
                    <ExpandMoreRoundedIcon
                        sx={{
                            fontSize: 18,
                            color: "text.secondary",
                            transform: expanded ? "none" : "rotate(-90deg)",
                            transition: "transform 150ms ease",
                        }}
                    />
                </Box>
            ) : (
                content
            )}
        </Stack>
    );
}
