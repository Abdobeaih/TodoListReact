import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import type { Task, TaskDraft } from "../types/task";
import { createId } from "../lib/id";
import { loadTasks, saveTasks } from "../lib/storage";
import { taskReducer } from "./taskReducer";
import { TaskStoreContext, type PendingUndo } from "./taskStoreContext";

function initTasks(): Task[] {
    return loadTasks() ?? [];
}

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, dispatch] = useReducer(taskReducer, undefined, initTasks);
    const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);

    useEffect(() => {
        saveTasks(tasks);
    }, [tasks]);

    const addTask = useCallback((draft: TaskDraft) => {
        dispatch({
            type: "task/added",
            payload: { draft, id: createId(), now: new Date().toISOString() },
        });
    }, []);

    const updateTask = useCallback((id: string, changes: Partial<TaskDraft>) => {
        dispatch({ type: "task/updated", payload: { id, changes, now: new Date().toISOString() } });
    }, []);

    const removeTasks = useCallback(
        (ids: string[]) => {
            if (ids.length === 0) return;
            const removing = new Set(ids);
            const captured = tasks.filter((task) => removing.has(task.id));
            if (captured.length === 0) return;
            dispatch({ type: "tasks/removed", payload: { ids } });
            setPendingUndo({
                tasks: captured,
                count: captured.length,
                label: captured.length === 1 ? "Task deleted" : `${captured.length} tasks deleted`,
            });
        },
        [tasks],
    );

    const clearCompleted = useCallback(() => {
        removeTasks(tasks.filter((task) => task.status === "done").map((task) => task.id));
    }, [removeTasks, tasks]);

    const undoLastRemoval = useCallback(() => {
        if (!pendingUndo) return;
        dispatch({ type: "tasks/restored", payload: { tasks: pendingUndo.tasks } });
        setPendingUndo(null);
    }, [pendingUndo]);

    const value = useMemo(
        () => ({
            tasks,
            addTask,
            updateTask,
            removeTasks,
            clearCompleted,
            undoLastRemoval,
            pendingUndo,
        }),
        [tasks, addTask, updateTask, removeTasks, clearCompleted, undoLastRemoval, pendingUndo],
    );

    return <TaskStoreContext.Provider value={value}>{children}</TaskStoreContext.Provider>;
}
