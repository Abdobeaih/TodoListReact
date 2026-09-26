import type { Task, TaskDraft } from "../types/task";
import { EMPTY_DRAFT } from "../types/task";

let counter = 0;

export function makeTask(overrides: Partial<Task> = {}): Task {
    counter += 1;
    const id = overrides.id ?? `task-${counter}`;
    const createdAt = overrides.createdAt ?? `2026-01-0${(counter % 9) + 1}T09:00:00.000Z`;
    return {
        id,
        title: `Task ${counter}`,
        notes: "",
        status: "todo",
        priority: "medium",
        dueDate: null,
        project: "Inbox",
        tags: [],
        createdAt,
        updatedAt: createdAt,
        completedAt: null,
        ...overrides,
    };
}

export function makeDraft(overrides: Partial<TaskDraft> = {}): TaskDraft {
    return { ...EMPTY_DRAFT, ...overrides };
}

/** Writes tasks in the exact shape the app persists, so tests boot from known data. */
export function seedTasks(tasks: Task[]): void {
    window.localStorage.setItem("taskflow.tasks", JSON.stringify({ version: 1, tasks }));
}

export function readStoredTasks(): Task[] | null {
    const raw = window.localStorage.getItem("taskflow.tasks");
    if (!raw) return null;
    return (JSON.parse(raw) as { tasks: Task[] }).tasks;
}
