import { describe, expect, it } from "vitest";
import { taskReducer } from "./taskReducer";
import { makeDraft, makeTask } from "../test/factories";
import type { Task } from "../types/task";

const NOW = "2026-09-26T10:00:00.000Z";
const LATER = "2026-09-27T10:00:00.000Z";

describe("taskReducer", () => {
    describe("task/added", () => {
        it("appends a normalised task", () => {
            const state = taskReducer([], {
                type: "task/added",
                payload: {
                    draft: makeDraft({ title: "  New task ", tags: ["A", "a"] }),
                    id: "new",
                    now: NOW,
                },
            });

            expect(state).toHaveLength(1);
            expect(state[0]).toMatchObject({
                id: "new",
                title: "New task",
                tags: ["a"],
                createdAt: NOW,
                updatedAt: NOW,
                completedAt: null,
            });
        });

        it("does not mutate the previous state", () => {
            const initial = [makeTask({ id: "a" })];
            const snapshot = [...initial];
            taskReducer(initial, {
                type: "task/added",
                payload: { draft: makeDraft({ title: "x" }), id: "new", now: NOW },
            });
            expect(initial).toEqual(snapshot);
        });
    });

    describe("task/updated", () => {
        const base = [
            makeTask({ id: "a", title: "Original", status: "todo" }),
            makeTask({ id: "b" }),
        ];

        it("changes only the targeted task", () => {
            const state = taskReducer(base, {
                type: "task/updated",
                payload: { id: "a", changes: { title: "Renamed" }, now: LATER },
            });

            expect(state[0].title).toBe("Renamed");
            expect(state[1]).toEqual(base[1]);
        });

        it("trims text and stamps updatedAt", () => {
            const state = taskReducer(base, {
                type: "task/updated",
                payload: {
                    id: "a",
                    changes: { title: "  Padded  ", notes: "  note " },
                    now: LATER,
                },
            });

            expect(state[0].title).toBe("Padded");
            expect(state[0].notes).toBe("note");
            expect(state[0].updatedAt).toBe(LATER);
        });

        it("refuses to blank out a title", () => {
            const state = taskReducer(base, {
                type: "task/updated",
                payload: { id: "a", changes: { title: "   " }, now: LATER },
            });
            expect(state[0].title).toBe("Original");
        });

        it("sets completedAt when moved to done, and keeps the original stamp", () => {
            const done = taskReducer(base, {
                type: "task/updated",
                payload: { id: "a", changes: { status: "done" }, now: NOW },
            });
            expect(done[0].completedAt).toBe(NOW);

            const again = taskReducer(done, {
                type: "task/updated",
                payload: { id: "a", changes: { status: "done" }, now: LATER },
            });
            expect(again[0].completedAt).toBe(NOW);
        });

        it("clears completedAt when reopened", () => {
            const done = [makeTask({ id: "a", status: "done", completedAt: NOW })];
            const state = taskReducer(done, {
                type: "task/updated",
                payload: { id: "a", changes: { status: "todo" }, now: LATER },
            });
            expect(state[0].completedAt).toBeNull();
        });

        it("can clear a due date with null and normalise tags", () => {
            const withDate = [makeTask({ id: "a", dueDate: "2026-10-01", tags: ["One"] })];
            const state = taskReducer(withDate, {
                type: "task/updated",
                payload: {
                    id: "a",
                    changes: { dueDate: null, tags: [" Two ", "two"] },
                    now: LATER,
                },
            });
            expect(state[0].dueDate).toBeNull();
            expect(state[0].tags).toEqual(["two"]);
        });

        it("leaves the list untouched for an unknown id", () => {
            const state = taskReducer(base, {
                type: "task/updated",
                payload: { id: "missing", changes: { title: "x" }, now: LATER },
            });
            expect(state).toEqual(base);
        });
    });

    describe("tasks/removed", () => {
        const base = [makeTask({ id: "a" }), makeTask({ id: "b" }), makeTask({ id: "c" })];

        it("removes a single task", () => {
            expect(
                taskReducer(base, { type: "tasks/removed", payload: { ids: ["b"] } }).map(
                    (t) => t.id,
                ),
            ).toEqual(["a", "c"]);
        });

        it("removes several at once", () => {
            expect(
                taskReducer(base, { type: "tasks/removed", payload: { ids: ["a", "c"] } }).map(
                    (t) => t.id,
                ),
            ).toEqual(["b"]);
        });

        it("ignores an empty or unknown id list", () => {
            expect(taskReducer(base, { type: "tasks/removed", payload: { ids: [] } })).toBe(base);
            expect(taskReducer(base, { type: "tasks/removed", payload: { ids: ["zz"] } })).toEqual(
                base,
            );
        });
    });

    describe("tasks/restored", () => {
        it("puts a task back in chronological order", () => {
            const remaining: Task[] = [
                makeTask({ id: "old", createdAt: "2026-01-01T00:00:00.000Z" }),
                makeTask({ id: "new", createdAt: "2026-12-01T00:00:00.000Z" }),
            ];
            const removed = makeTask({ id: "mid", createdAt: "2026-06-01T00:00:00.000Z" });

            const state = taskReducer(remaining, {
                type: "tasks/restored",
                payload: { tasks: [removed] },
            });

            expect(state.map((t) => t.id)).toEqual(["old", "mid", "new"]);
        });

        it("restores several tasks at once", () => {
            const state = taskReducer(
                [makeTask({ id: "keep", createdAt: "2026-01-01T00:00:00.000Z" })],
                {
                    type: "tasks/restored",
                    payload: {
                        tasks: [
                            makeTask({ id: "b", createdAt: "2026-03-01T00:00:00.000Z" }),
                            makeTask({ id: "a", createdAt: "2026-02-01T00:00:00.000Z" }),
                        ],
                    },
                },
            );
            expect(state.map((t) => t.id)).toEqual(["keep", "a", "b"]);
        });

        it("is a no-op for an empty payload", () => {
            const base = [makeTask({ id: "a" })];
            expect(taskReducer(base, { type: "tasks/restored", payload: { tasks: [] } })).toBe(
                base,
            );
        });
    });

    describe("tasks/replaced", () => {
        it("swaps the whole list", () => {
            const state = taskReducer([makeTask({ id: "a" })], {
                type: "tasks/replaced",
                payload: { tasks: [makeTask({ id: "z" })] },
            });
            expect(state.map((t) => t.id)).toEqual(["z"]);
        });
    });

    it("returns the current state for an unknown action", () => {
        const base = [makeTask({ id: "a" })];
        expect(taskReducer(base, { type: "nope" } as never)).toBe(base);
    });
});
