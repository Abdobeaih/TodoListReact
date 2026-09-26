import { describe, expect, it } from "vitest";
import { loadTasks, normalizeTask, saveTasks } from "./storage";
import { makeTask } from "../test/factories";
import type { Task } from "../types/task";

const FALLBACK = "2026-09-26T10:00:00.000Z";

describe("normalizeTask", () => {
    it("keeps a valid task intact", () => {
        const task = makeTask({ id: "a", title: "Valid", notes: "n", priority: "high" });
        expect(normalizeTask(task, FALLBACK)).toEqual(task);
    });

    it("fills defaults for missing fields", () => {
        expect(normalizeTask({ id: "a", title: "Sparse" }, FALLBACK)).toEqual({
            id: "a",
            title: "Sparse",
            notes: "",
            status: "todo",
            priority: "medium",
            dueDate: null,
            project: "Inbox",
            tags: [],
            createdAt: FALLBACK,
            updatedAt: FALLBACK,
            completedAt: null,
        });
    });

    it("rejects entries without a usable title", () => {
        expect(normalizeTask({ id: "a" }, FALLBACK)).toBeNull();
        expect(normalizeTask({ id: "a", title: "   " }, FALLBACK)).toBeNull();
        expect(normalizeTask(null, FALLBACK)).toBeNull();
        expect(normalizeTask("a string", FALLBACK)).toBeNull();
        expect(normalizeTask([1, 2], FALLBACK)).toBeNull();
    });

    it("falls back when an enum value is unrecognised", () => {
        const result = normalizeTask(
            { title: "x", status: "archived", priority: "extreme" },
            FALLBACK,
        );
        expect(result?.status).toBe("todo");
        expect(result?.priority).toBe("medium");
    });

    it("discards an impossible due date", () => {
        expect(normalizeTask({ title: "x", dueDate: "2026-02-30" }, FALLBACK)?.dueDate).toBeNull();
        expect(normalizeTask({ title: "x", dueDate: "tomorrow" }, FALLBACK)?.dueDate).toBeNull();
    });

    it("generates an id when one is missing", () => {
        expect(normalizeTask({ title: "x" }, FALLBACK)?.id).toBeTruthy();
    });
});

describe("saveTasks and loadTasks", () => {
    it("round-trips tasks", () => {
        const tasks = [makeTask({ id: "a" }), makeTask({ id: "b", priority: "urgent" })];
        saveTasks(tasks);
        expect(loadTasks()).toEqual(tasks);
    });

    it("returns null when nothing has ever been saved", () => {
        expect(loadTasks()).toBeNull();
    });

    it("overwrites rather than appending", () => {
        saveTasks([makeTask({ id: "a" })]);
        saveTasks([makeTask({ id: "b" })]);
        expect(loadTasks()?.map((task) => task.id)).toEqual(["b"]);
    });

    it("drops corrupt entries instead of crashing", () => {
        window.localStorage.setItem(
            "taskflow.tasks",
            JSON.stringify({ version: 1, tasks: [{ id: "a", title: "Good" }, { id: "b" }, null] }),
        );
        expect(loadTasks()?.map((task) => task.title)).toEqual(["Good"]);
    });

    it("recovers from unparseable JSON", () => {
        window.localStorage.setItem("taskflow.tasks", "{not json");
        expect(loadTasks()).toBeNull();
    });
});

describe("legacy migration", () => {
    it("upgrades the old { title, details, Incomplete } shape", () => {
        window.localStorage.setItem(
            "todos",
            JSON.stringify([
                { id: "old-1", title: "Read Book", details: "Tesla", Incomplete: true },
                { id: "old-2", title: "WorkOut", details: "Go Gym", Incomplete: false },
            ]),
        );

        const migrated = loadTasks() as Task[];

        expect(migrated).toHaveLength(2);
        expect(migrated[0]).toMatchObject({
            id: "old-1",
            title: "Read Book",
            notes: "Tesla",
            status: "todo",
            project: "Inbox",
        });
        expect(migrated[1]).toMatchObject({ title: "WorkOut", status: "done" });
    });

    it("moves the data to the new key and clears the old one", () => {
        window.localStorage.setItem(
            "todos",
            JSON.stringify([{ id: "old-1", title: "Read Book", details: "", Incomplete: true }]),
        );

        loadTasks();

        expect(window.localStorage.getItem("todos")).toBeNull();
        const persisted = JSON.parse(window.localStorage.getItem("taskflow.tasks") as string);
        expect(persisted.version).toBe(1);
        expect(persisted.tasks).toHaveLength(1);
    });

    it("prefers current data when both keys exist", () => {
        saveTasks([makeTask({ id: "new", title: "Current" })]);
        window.localStorage.setItem(
            "todos",
            JSON.stringify([{ id: "old", title: "Legacy", details: "", Incomplete: true }]),
        );

        expect(loadTasks()?.map((task) => task.id)).toEqual(["new"]);
    });

    it("ignores a legacy key holding the wrong shape", () => {
        window.localStorage.setItem("todos", JSON.stringify({ not: "an array" }));
        expect(loadTasks()).toBeNull();
    });

    it("returns null on a first run so the app can start empty", () => {
        expect(loadTasks()).toBeNull();
    });
});
