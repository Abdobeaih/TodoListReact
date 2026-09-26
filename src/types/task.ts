export const TASK_STATUSES = ["todo", "doing", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
    id: string;
    title: string;
    notes: string;
    status: TaskStatus;
    priority: TaskPriority;
    /** Local calendar date as `YYYY-MM-DD`, or null when the task has no deadline. */
    dueDate: string | null;
    /** Free-form bucket. An empty string means the task lives in the Inbox. */
    project: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
}

/** The user-editable shape of a task. Everything else is managed by the app. */
export type TaskDraft = Pick<
    Task,
    "title" | "notes" | "status" | "priority" | "dueDate" | "project" | "tags"
>;

export const EMPTY_DRAFT: TaskDraft = {
    title: "",
    notes: "",
    status: "todo",
    priority: "medium",
    dueDate: null,
    project: "",
    tags: [],
};

export const DEFAULT_PROJECT = "Inbox";

export const STATUS_META: Record<
    TaskStatus,
    { label: string; short: string; color: "default" | "info" | "success" }
> = {
    todo: { label: "To do", short: "To do", color: "default" },
    doing: { label: "In progress", short: "Doing", color: "info" },
    done: { label: "Completed", short: "Done", color: "success" },
};

export const PRIORITY_META: Record<
    TaskPriority,
    { label: string; weight: number; color: "success" | "info" | "warning" | "error" }
> = {
    low: { label: "Low", weight: 0, color: "success" },
    medium: { label: "Medium", weight: 1, color: "info" },
    high: { label: "High", weight: 2, color: "warning" },
    urgent: { label: "Urgent", weight: 3, color: "error" },
};

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = (
    TASK_PRIORITIES as readonly TaskPriority[]
).map((value) => ({ value, label: PRIORITY_META[value].label }));

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = (
    TASK_STATUSES as readonly TaskStatus[]
).map((value) => ({ value, label: STATUS_META[value].label }));

export function isTaskStatus(value: unknown): value is TaskStatus {
    return typeof value === "string" && (TASK_STATUSES as readonly string[]).includes(value);
}

export function isTaskPriority(value: unknown): value is TaskPriority {
    return typeof value === "string" && (TASK_PRIORITIES as readonly string[]).includes(value);
}
