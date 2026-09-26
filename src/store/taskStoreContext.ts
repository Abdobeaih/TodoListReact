import { createContext, useContext } from "react";
import type { Task, TaskDraft } from "../types/task";

export interface PendingUndo {
    /** Tasks captured before the removal, replayed by `undoLastRemoval`. */
    tasks: Task[];
    count: number;
    label: string;
}

export interface TaskStoreValue {
    tasks: Task[];
    addTask: (draft: TaskDraft) => void;
    updateTask: (id: string, changes: Partial<TaskDraft>) => void;
    removeTasks: (ids: string[]) => void;
    clearCompleted: () => void;
    undoLastRemoval: () => void;
    pendingUndo: PendingUndo | null;
}

export const TaskStoreContext = createContext<TaskStoreValue | null>(null);

export function useTaskStore(): TaskStoreValue {
    const store = useContext(TaskStoreContext);
    if (!store) {
        throw new Error("useTaskStore must be used inside <TaskProvider>");
    }
    return store;
}
