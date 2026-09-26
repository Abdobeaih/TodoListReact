import type { Task, TaskDraft } from "../types/task";
import { createTask, normalizeTags } from "../lib/tasks";

export type TaskAction =
    | { type: "task/added"; payload: { draft: TaskDraft; id: string; now: string } }
    | { type: "task/updated"; payload: { id: string; changes: Partial<TaskDraft>; now: string } }
    | { type: "tasks/removed"; payload: { ids: string[] } }
    | { type: "tasks/restored"; payload: { tasks: Task[] } }
    | { type: "tasks/replaced"; payload: { tasks: Task[] } };

const DRAFT_KEYS = ["title", "notes", "status", "priority", "dueDate", "project", "tags"] as const;

/** Rebuilds a task from a partial update, dropping unknown or empty values. */
function applyChanges(task: Task, changes: Partial<TaskDraft>, now: string): Task {
    const next: Task = { ...task };

    for (const key of DRAFT_KEYS) {
        if (!(key in changes)) continue;
        switch (key) {
            case "title": {
                const title = (changes.title ?? "").trim();
                if (title) next.title = title;
                break;
            }
            case "notes":
                next.notes = (changes.notes ?? "").trim();
                break;
            case "project":
                next.project = (changes.project ?? "").trim();
                break;
            case "tags":
                next.tags = normalizeTags(changes.tags ?? []);
                break;
            case "status": {
                const status = changes.status;
                if (!status) break;
                next.status = status;
                next.completedAt = status === "done" ? (task.completedAt ?? now) : null;
                break;
            }
            case "priority":
                if (changes.priority) next.priority = changes.priority;
                break;
            case "dueDate":
                next.dueDate = changes.dueDate ?? null;
                break;
        }
    }

    next.updatedAt = now;
    return next;
}

/**
 * Re-inserts restored tasks in chronological order so undo puts a task back where a
 * user expects it instead of dumping it at the end of the list.
 */
function insertChronologically(existing: Task[], incoming: Task[]): Task[] {
    if (incoming.length === 0) return existing;
    return [...existing, ...incoming].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function taskReducer(state: Task[], action: TaskAction): Task[] {
    switch (action.type) {
        case "task/added":
            return [
                ...state,
                createTask(action.payload.draft, action.payload.id, action.payload.now),
            ];

        case "task/updated":
            return state.map((task) =>
                task.id === action.payload.id
                    ? applyChanges(task, action.payload.changes, action.payload.now)
                    : task,
            );

        case "tasks/removed": {
            const removing = new Set(action.payload.ids);
            if (removing.size === 0) return state;
            return state.filter((task) => !removing.has(task.id));
        }

        case "tasks/restored":
            return insertChronologically(state, action.payload.tasks);

        case "tasks/replaced":
            return action.payload.tasks;

        default:
            return state;
    }
}
