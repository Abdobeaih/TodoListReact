import {
    DEFAULT_PROJECT,
    isTaskPriority,
    isTaskStatus,
    type Task,
    type TaskStatus,
} from "../types/task";
import { isValidISODate } from "./date";
import { createId } from "./id";

const STORAGE_KEY = "taskflow.tasks";
const LEGACY_KEY = "todos";
const SCHEMA_VERSION = 1;

interface PersistedPayload {
    version: number;
    tasks: unknown[];
}

/** Falls back to an in-memory map when localStorage is unavailable (private mode, quota, SSR). */
const memoryFallback = new Map<string, string>();

function readRaw(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return memoryFallback.get(key) ?? null;
    }
}

function writeRaw(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        memoryFallback.set(key, value);
    }
}

function removeRaw(key: string): void {
    try {
        window.localStorage.removeItem(key);
    } catch {
        memoryFallback.delete(key);
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback;
}

function asTags(value: unknown): string[] {
    const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
    const tags = new Set<string>();
    for (const entry of raw) {
        if (typeof entry !== "string") continue;
        const tag = entry.trim().toLowerCase();
        if (tag) tags.add(tag);
    }
    return [...tags];
}

function asDueDate(value: unknown): string | null {
    return typeof value === "string" && isValidISODate(value) ? value : null;
}

function asTimestamp(value: unknown, fallback: string): string {
    return typeof value === "string" && value.length > 0 ? value : fallback;
}

/**
 * Coerces arbitrary stored JSON into a valid Task, or null when it is unusable.
 * Corrupt entries are dropped instead of crashing the app on boot.
 */
export function normalizeTask(raw: unknown, fallbackTimestamp: string): Task | null {
    if (!isRecord(raw)) return null;

    const title = asString(raw.title).trim();
    if (!title) return null;

    const status: TaskStatus = isTaskStatus(raw.status) ? raw.status : "todo";
    const createdAt = asTimestamp(raw.createdAt, fallbackTimestamp);

    return {
        id: asString(raw.id) || createId(),
        title,
        notes: asString(raw.notes ?? raw.details),
        status,
        priority: isTaskPriority(raw.priority) ? raw.priority : "medium",
        dueDate: asDueDate(raw.dueDate),
        project: asString(raw.project).trim() || DEFAULT_PROJECT,
        tags: asTags(raw.tags),
        createdAt,
        updatedAt: asTimestamp(raw.updatedAt, createdAt),
        completedAt: typeof raw.completedAt === "string" ? raw.completedAt : null,
    };
}

/** Converts the pre-1.0 `{ id, title, details, Incomplete }` records into Tasks. */
function migrateLegacyTodos(raw: unknown, fallbackTimestamp: string): Task[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((entry) => {
            const task = normalizeTask(
                isRecord(entry) && typeof entry.Incomplete === "boolean"
                    ? {
                          ...entry,
                          notes: entry.details,
                          status: entry.Incomplete ? "todo" : "done",
                      }
                    : entry,
                fallbackTimestamp,
            );
            return task;
        })
        .filter((task): task is Task => task !== null);
}

function readPersisted(key: string): unknown {
    const raw = readRaw(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as unknown;
    } catch {
        // Corrupt payload: drop it rather than trapping the user in a broken state.
        removeRaw(key);
        return null;
    }
}

export function saveTasks(tasks: Task[]): void {
    const payload: PersistedPayload = { version: SCHEMA_VERSION, tasks };
    try {
        writeRaw(STORAGE_KEY, JSON.stringify(payload));
    } catch {
        // Quota exceeded: the in-session state stays correct even if the write is lost.
    }
}

export function clearStoredTasks(): void {
    removeRaw(STORAGE_KEY);
}

/**
 * Reads persisted tasks, upgrading legacy data on the way. Returns null when the user
 * has never saved anything, which lets the caller treat a first run as a clean slate.
 */
export function loadTasks(): Task[] | null {
    const fallbackTimestamp = new Date().toISOString();

    const persisted = readPersisted(STORAGE_KEY);
    if (persisted !== null) {
        if (Array.isArray(persisted)) return migrateLegacyTodos(persisted, fallbackTimestamp);
        if (isRecord(persisted) && Array.isArray(persisted.tasks)) {
            return persisted.tasks
                .map((entry) => normalizeTask(entry, fallbackTimestamp))
                .filter((task): task is Task => task !== null);
        }
        removeRaw(STORAGE_KEY);
    }

    const legacy = readPersisted(LEGACY_KEY);
    if (legacy !== null) {
        const migrated = migrateLegacyTodos(legacy, fallbackTimestamp);
        if (migrated.length > 0) {
            saveTasks(migrated);
            removeRaw(LEGACY_KEY);
            return migrated;
        }
    }

    return null;
}
