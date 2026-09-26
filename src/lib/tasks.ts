import { DEFAULT_PROJECT, PRIORITY_META, type Task, type TaskDraft } from "../types/task";
import type { SortOption, TaskFilters } from "../types/filters";
import { daysUntil } from "./date";

/** A task is overdue only while it is still open, so finished work never nags the user. */
export function isOverdue(task: Task, now: Date = new Date()): boolean {
    if (task.status === "done" || !task.dueDate) return false;
    return daysUntil(task.dueDate, now) < 0;
}

export function isDueToday(task: Task, now: Date = new Date()): boolean {
    if (!task.dueDate) return false;
    return daysUntil(task.dueDate, now) === 0;
}

function matchesQuery(task: Task, query: string): boolean {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
        task.title.toLowerCase().includes(needle) ||
        task.notes.toLowerCase().includes(needle) ||
        task.project.toLowerCase().includes(needle) ||
        task.tags.some((tag) => tag.toLowerCase().includes(needle))
    );
}

function matchesDueFilter(task: Task, due: TaskFilters["due"], now: Date): boolean {
    if (due === "any") return true;
    if (due === "no-date") return task.dueDate === null;
    if (due === "overdue") return isOverdue(task, now);
    if (!task.dueDate) return false;
    const days = daysUntil(task.dueDate, now);
    if (due === "today") return days === 0;
    return days >= 0 && days <= 7;
}

export function filterTasks(tasks: Task[], filters: TaskFilters, now: Date = new Date()): Task[] {
    return tasks.filter((task) => {
        if (!matchesQuery(task, filters.query)) return false;
        if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return false;
        if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
            return false;
        }
        if (filters.projects.length > 0 && !filters.projects.includes(task.project)) return false;
        if (filters.tags.length > 0 && !filters.tags.some((tag) => task.tags.includes(tag))) {
            return false;
        }
        return matchesDueFilter(task, filters.due, now);
    });
}

function byDueAscending(a: Task, b: Task): number {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
}

function byPriorityDescending(a: Task, b: Task): number {
    return PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight;
}

const COMPARATORS: Record<SortOption, (a: Task, b: Task) => number> = {
    "due-asc": (a, b) => byDueAscending(a, b) || byPriorityDescending(a, b),
    "due-desc": (a, b) => -byDueAscending(a, b) || byPriorityDescending(a, b),
    "priority-desc": (a, b) => byPriorityDescending(a, b) || byDueAscending(a, b),
    "created-desc": (a, b) => b.createdAt.localeCompare(a.createdAt),
    "created-asc": (a, b) => a.createdAt.localeCompare(b.createdAt),
    "title-asc": (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
};

export function sortTasks(tasks: Task[], sort: SortOption): Task[] {
    return [...tasks].sort(COMPARATORS[sort]);
}

export const DUE_GROUPS = [
    "overdue",
    "today",
    "tomorrow",
    "week",
    "later",
    "someday",
    "completed",
] as const;
export type DueGroupId = (typeof DUE_GROUPS)[number];

const GROUP_LABELS: Record<DueGroupId, string> = {
    overdue: "Overdue",
    today: "Today",
    tomorrow: "Tomorrow",
    week: "This week",
    later: "Later",
    someday: "No date",
    completed: "Completed",
};

export interface DueGroup {
    id: DueGroupId;
    label: string;
    tasks: Task[];
}

/** Bucket a single task for the grouped list. Finished work is never treated as urgent. */
export function dueGroupFor(task: Task, now: Date = new Date()): DueGroupId {
    if (task.status === "done") return "completed";
    if (!task.dueDate) return "someday";

    const days = daysUntil(task.dueDate, now);
    if (Number.isNaN(days)) return "someday";
    if (days < 0) return "overdue";
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    return days <= 7 ? "week" : "later";
}

/**
 * Splits an already-sorted list into due-date sections, preserving input order within
 * each section. Empty sections are dropped so the UI never renders a bare header.
 */
export function groupTasksByDue(tasks: Task[], now: Date = new Date()): DueGroup[] {
    const buckets = new Map<DueGroupId, Task[]>();
    for (const task of tasks) {
        const id = dueGroupFor(task, now);
        const bucket = buckets.get(id);
        if (bucket) bucket.push(task);
        else buckets.set(id, [task]);
    }

    return DUE_GROUPS.filter((id) => (buckets.get(id)?.length ?? 0) > 0).map((id) => ({
        id,
        label: GROUP_LABELS[id],
        tasks: buckets.get(id) ?? [],
    }));
}

/**
 * Grouping by due date is itself an ordering, so it only applies to the due-date sorts.
 * Any other sort falls back to a single flat list rather than pretending to be grouped.
 */
export function groupsByDue(sort: SortOption): boolean {
    return sort === "due-asc";
}

export interface TaskStats {
    total: number;
    todo: number;
    doing: number;
    done: number;
    overdue: number;
    dueToday: number;
    completionRate: number;
}

export function computeStats(tasks: Task[], now: Date = new Date()): TaskStats {
    let todo = 0;
    let doing = 0;
    let done = 0;
    let overdue = 0;
    let dueToday = 0;

    for (const task of tasks) {
        if (task.status === "done") done += 1;
        else if (task.status === "doing") doing += 1;
        else todo += 1;

        if (task.status !== "done") {
            if (isOverdue(task, now)) overdue += 1;
            if (isDueToday(task, now)) dueToday += 1;
        }
    }

    const total = tasks.length;
    return {
        total,
        todo,
        doing,
        done,
        overdue,
        dueToday,
        completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
    };
}

export function collectProjects(tasks: Task[]): string[] {
    const projects = new Set<string>();
    for (const task of tasks) projects.add(task.project || DEFAULT_PROJECT);
    return [...projects].sort((a, b) => {
        if (a === DEFAULT_PROJECT) return -1;
        if (b === DEFAULT_PROJECT) return 1;
        return a.localeCompare(b, undefined, { sensitivity: "base" });
    });
}

export function collectTags(tasks: Task[]): string[] {
    const tags = new Set<string>();
    for (const task of tasks) for (const tag of task.tags) tags.add(tag);
    return [...tags].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/** Normalizes free-text tags: trimmed, de-duplicated, lower case, no empty entries. */
export function normalizeTags(input: string[] | string): string[] {
    const raw = Array.isArray(input) ? input : input.split(",");
    const seen = new Set<string>();
    for (const value of raw) {
        const tag = value.trim().toLowerCase();
        if (tag) seen.add(tag);
    }
    return [...seen];
}

export function createTask(draft: TaskDraft, id: string, now: string): Task {
    const isDone = draft.status === "done";
    return {
        id,
        title: draft.title.trim(),
        notes: draft.notes.trim(),
        status: draft.status,
        priority: draft.priority,
        dueDate: draft.dueDate,
        project: draft.project.trim() || DEFAULT_PROJECT,
        tags: normalizeTags(draft.tags),
        createdAt: now,
        updatedAt: now,
        completedAt: isDone ? now : null,
    };
}
