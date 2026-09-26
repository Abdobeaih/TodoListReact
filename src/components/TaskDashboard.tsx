import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Stack from "@mui/material/Stack";
import { useTaskStore, type PendingUndo } from "../store/taskStoreContext";
import { useNow } from "../hooks/useNow";
import {
    collectProjects,
    collectTags,
    computeStats,
    filterTasks,
    groupTasksByDue,
    groupsByDue,
    sortTasks,
} from "../lib/tasks";
import { DEFAULT_FILTERS, countActiveFilters, type TaskFilters } from "../types/filters";
import type { Task, TaskDraft, TaskPriority, TaskStatus } from "../types/task";
import { useFeedback } from "./feedbackContext";
import { ConfirmDialog } from "./ConfirmDialog";
import { ProgressSummary } from "./ProgressSummary";
import { TaskFormDialog, type TaskFormTarget } from "./TaskFormDialog";
import { TaskList } from "./TaskList";
import { TaskToolbar } from "./TaskToolbar";

function isTypingTarget(target: EventTarget | null): boolean {
    const element = target as HTMLElement | null;
    if (!element) return false;
    return (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT" ||
        element.isContentEditable
    );
}

export function TaskDashboard() {
    const {
        tasks,
        addTask,
        updateTask,
        removeTasks,
        clearCompleted,
        undoLastRemoval,
        pendingUndo,
    } = useTaskStore();
    const { notify } = useFeedback();
    const now = useNow();

    const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [formTarget, setFormTarget] = useState<TaskFormTarget | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const stats = useMemo(() => computeStats(tasks, now), [tasks, now]);
    const projectOptions = useMemo(() => collectProjects(tasks), [tasks]);
    const tagOptions = useMemo(() => collectTags(tasks), [tasks]);
    const filtersActive = countActiveFilters(filters) > 0;

    const visibleTasks = useMemo(
        () => sortTasks(filterTasks(tasks, filters, now), filters.sort),
        [tasks, filters, now],
    );

    const grouped = groupsByDue(filters.sort);
    const groups = useMemo(
        () => (grouped ? groupTasksByDue(visibleTasks, now) : []),
        [grouped, visibleTasks, now],
    );

    const openCreateDialog = useCallback(() => setFormTarget({ mode: "create" }), []);

    const handleSubmit = useCallback(
        (draft: TaskDraft, target: TaskFormTarget) => {
            if (target.mode === "create") {
                addTask(draft);
                notify("Task created");
            } else {
                updateTask(target.task.id, draft);
                notify("Task updated");
            }
            setFormTarget(null);
        },
        [addTask, updateTask, notify],
    );

    // The leading circle is a two-state control: finishing is one click, unfinishing is one click.
    const handleToggleComplete = useCallback(
        (task: Task) => updateTask(task.id, { status: task.status === "done" ? "todo" : "done" }),
        [updateTask],
    );

    const handleSetStatus = useCallback(
        (task: Task, status: TaskStatus) => {
            if (task.status === status) return;
            updateTask(task.id, { status });
            notify(`Moved to ${status === "doing" ? "in progress" : status}`);
        },
        [updateTask, notify],
    );

    const handleSetPriority = useCallback(
        (task: Task, priority: TaskPriority) => {
            if (task.priority === priority) return;
            updateTask(task.id, { priority });
        },
        [updateTask],
    );

    const handleFilterByProject = useCallback((project: string) => {
        setFilters((current) => ({ ...current, projects: [project] }));
        setFiltersOpen(true);
    }, []);

    const handleFilterByTag = useCallback((tag: string) => {
        setFilters((current) => ({ ...current, tags: [tag] }));
        setFiltersOpen(true);
    }, []);

    const handleToggleOverdue = useCallback(() => {
        setFilters((current) => ({
            ...current,
            due: current.due === "overdue" ? "any" : "overdue",
        }));
        setFiltersOpen(true);
    }, []);

    const handleToggleDueToday = useCallback(() => {
        setFilters((current) => ({ ...current, due: current.due === "today" ? "any" : "today" }));
        setFiltersOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (deleteTarget) removeTasks([deleteTarget.id]);
        setDeleteTarget(null);
    }, [deleteTarget, removeTasks]);

    // Every removal surfaces an undo affordance, including bulk "clear completed".
    const handledUndo = useRef<PendingUndo | null>(null);
    useEffect(() => {
        if (!pendingUndo || pendingUndo === handledUndo.current) return;
        handledUndo.current = pendingUndo;
        notify(pendingUndo.label, {
            tone: "info",
            action: { label: "Undo", onClick: undoLastRemoval },
        });
    }, [pendingUndo, notify, undoLastRemoval]);

    // Power-user shortcuts: N for a new task, / to jump to search. Advertised in the
    // "New task" tooltip rather than a permanent footer legend.
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey)
                return;
            if (formTarget || deleteTarget) return;

            if (event.key === "/") {
                event.preventDefault();
                searchRef.current?.focus();
            } else if (event.key === "n" || event.key === "N") {
                event.preventDefault();
                openCreateDialog();
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [formTarget, deleteTarget, openCreateDialog]);

    return (
        <>
            <Stack spacing={0}>
                <ProgressSummary
                    stats={stats}
                    overdueActive={filters.due === "overdue"}
                    dueTodayActive={filters.due === "today"}
                    onToggleOverdue={handleToggleOverdue}
                    onToggleDueToday={handleToggleDueToday}
                />

                <TaskToolbar
                    filters={filters}
                    onChange={setFilters}
                    filtersOpen={filtersOpen}
                    onToggleFilters={() => setFiltersOpen((open) => !open)}
                    onNewTask={openCreateDialog}
                    searchRef={searchRef}
                />

                <TaskList
                    tasks={visibleTasks}
                    groups={groups}
                    grouped={grouped}
                    totalCount={tasks.length}
                    filtersActive={filtersActive}
                    onToggleComplete={handleToggleComplete}
                    onSetStatus={handleSetStatus}
                    onSetPriority={handleSetPriority}
                    onEdit={(task) => setFormTarget({ mode: "edit", task })}
                    onDelete={setDeleteTarget}
                    onFilterByProject={handleFilterByProject}
                    onFilterByTag={handleFilterByTag}
                    onClearFilters={() =>
                        setFilters((current) => ({ ...DEFAULT_FILTERS, sort: current.sort }))
                    }
                    onCreateFirst={openCreateDialog}
                    onClearCompleted={clearCompleted}
                />
            </Stack>

            <TaskFormDialog
                open={formTarget !== null}
                target={formTarget ?? { mode: "create" }}
                projectOptions={projectOptions}
                tagOptions={tagOptions}
                onSubmit={handleSubmit}
                onClose={() => setFormTarget(null)}
            />

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Delete this task?"
                description={
                    deleteTarget
                        ? `"${deleteTarget.title}" will be removed. You can undo this from the notification.`
                        : ""
                }
                confirmLabel="Delete"
                destructive
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </>
    );
}
