import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import type { Task, TaskPriority, TaskStatus } from "../types/task";
import { EmptyState } from "./EmptyState";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
    tasks: Task[];
    totalCount: number;
    filtersActive: boolean;
    onCycleStatus: (task: Task) => void;
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
    totalCount,
    filtersActive,
    onCycleStatus,
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
    const hasCompleted = tasks.some((task) => task.status === "done");

    return (
        <Box component="section" aria-label="Tasks">
            {totalCount > 0 && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ px: 0.5, mb: 1.25 }}
                >
                    <Typography variant="body2" color="text.secondary" aria-live="polite">
                        Showing {tasks.length} of {totalCount} {totalCount === 1 ? "task" : "tasks"}
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
                        icon={<InboxRoundedIcon />}
                        title="No tasks yet"
                        description="Create your first task to start tracking progress, or use the sample tasks to explore TaskFlow."
                        action={
                            <Button variant="contained" onClick={onCreateFirst}>
                                Create a task
                            </Button>
                        }
                    />
                ) : (
                    <EmptyState
                        icon={<SearchOffRoundedIcon />}
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
            ) : (
                <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: "none" }}>
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onCycleStatus={onCycleStatus}
                            onSetStatus={onSetStatus}
                            onSetPriority={onSetPriority}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onFilterByProject={onFilterByProject}
                            onFilterByTag={onFilterByTag}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}
