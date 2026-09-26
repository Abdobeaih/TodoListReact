import { describe, expect, it } from "vitest";
import {
    collectProjects,
    collectTags,
    computeStats,
    createTask,
    dueGroupFor,
    filterTasks,
    groupTasksByDue,
    groupsByDue,
    isDueToday,
    isOverdue,
    normalizeTags,
    sortTasks,
} from "./tasks";
import { DEFAULT_FILTERS, type TaskFilters } from "../types/filters";
import { makeDraft, makeTask } from "../test/factories";

const NOW = new Date(2026, 8, 26, 10, 0);

function filters(overrides: Partial<TaskFilters> = {}): TaskFilters {
    return { ...DEFAULT_FILTERS, ...overrides };
}

const TASKS = [
    makeTask({
        id: "a",
        title: "Write the quarterly report",
        notes: "Include revenue numbers",
        status: "doing",
        priority: "high",
        dueDate: "2026-09-20",
        project: "Reporting",
        tags: ["writing", "finance"],
    }),
    makeTask({
        id: "b",
        title: "Book flights",
        status: "todo",
        priority: "urgent",
        dueDate: "2026-09-26",
        project: "Travel",
        tags: ["admin"],
    }),
    makeTask({
        id: "c",
        title: "Refactor the parser",
        notes: "Legacy code, no deadline",
        status: "done",
        priority: "low",
        dueDate: "2026-09-25",
        project: "Engineering",
        tags: ["code"],
        completedAt: "2026-09-25T10:00:00.000Z",
    }),
    makeTask({
        id: "d",
        title: "Plan offsite agenda",
        status: "todo",
        priority: "medium",
        project: "Inbox",
    }),
];

describe("isOverdue", () => {
    it("flags open tasks whose date has passed", () => {
        expect(isOverdue(TASKS[0], NOW)).toBe(true);
        expect(isOverdue(TASKS[1], NOW)).toBe(false);
    });

    it("never nags about completed work", () => {
        expect(isOverdue(TASKS[2], NOW)).toBe(false);
    });

    it("is false without a due date", () => {
        expect(isOverdue(TASKS[3], NOW)).toBe(false);
    });
});

describe("isDueToday", () => {
    it("matches only today's date", () => {
        expect(isDueToday(TASKS[1], NOW)).toBe(true);
        expect(isDueToday(TASKS[0], NOW)).toBe(false);
    });
});

describe("filterTasks", () => {
    it("returns everything by default", () => {
        expect(filterTasks(TASKS, filters(), NOW)).toHaveLength(4);
    });

    it("searches title, notes, project and tags, case insensitively", () => {
        expect(filterTasks(TASKS, filters({ query: "QUARTERLY" }), NOW).map((t) => t.id)).toEqual([
            "a",
        ]);
        expect(filterTasks(TASKS, filters({ query: "revenue" }), NOW).map((t) => t.id)).toEqual([
            "a",
        ]);
        expect(filterTasks(TASKS, filters({ query: "travel" }), NOW).map((t) => t.id)).toEqual([
            "b",
        ]);
        expect(filterTasks(TASKS, filters({ query: "finance" }), NOW).map((t) => t.id)).toEqual([
            "a",
        ]);
    });

    it("ignores surrounding whitespace in the query", () => {
        expect(filterTasks(TASKS, filters({ query: "   flights   " }), NOW)).toHaveLength(1);
    });

    it("treats status and priority selections as OR within a facet", () => {
        expect(
            filterTasks(TASKS, filters({ statuses: ["todo", "doing"] }), NOW).map((t) => t.id),
        ).toEqual(["a", "b", "d"]);
        expect(
            filterTasks(TASKS, filters({ priorities: ["urgent", "low"] }), NOW).map((t) => t.id),
        ).toEqual(["b", "c"]);
    });

    it("ANDs separate facets together", () => {
        const result = filterTasks(
            TASKS,
            filters({ statuses: ["todo"], priorities: ["urgent"] }),
            NOW,
        );
        expect(result.map((t) => t.id)).toEqual(["b"]);
    });

    it("matches any selected tag", () => {
        expect(
            filterTasks(TASKS, filters({ tags: ["code", "admin"] }), NOW).map((t) => t.id),
        ).toEqual(["b", "c"]);
    });

    it("filters by project", () => {
        expect(
            filterTasks(TASKS, filters({ projects: ["Engineering"] }), NOW).map((t) => t.id),
        ).toEqual(["c"]);
    });

    it("supports due date windows", () => {
        expect(filterTasks(TASKS, filters({ due: "overdue" }), NOW).map((t) => t.id)).toEqual([
            "a",
        ]);
        expect(filterTasks(TASKS, filters({ due: "today" }), NOW).map((t) => t.id)).toEqual(["b"]);
        expect(filterTasks(TASKS, filters({ due: "no-date" }), NOW).map((t) => t.id)).toEqual([
            "d",
        ]);
    });

    it("excludes finished tasks from the overdue window", () => {
        const doneOverdue = makeTask({ id: "e", status: "done", dueDate: "2026-01-01" });
        expect(filterTasks([doneOverdue], filters({ due: "overdue" }), NOW)).toHaveLength(0);
    });
});

describe("sortTasks", () => {
    it("puts undated tasks last when sorting by due date", () => {
        const sorted = sortTasks(TASKS, "due-asc").map((t) => t.id);
        expect(sorted[sorted.length - 1]).toBe("d");
        expect(sorted.slice(0, 3)).toEqual(["a", "c", "b"]);
    });

    it("reverses for due-desc", () => {
        const sorted = sortTasks(TASKS, "due-desc").map((t) => t.id);
        expect(sorted[0]).toBe("d");
    });

    it("sorts by priority, breaking ties by due date", () => {
        expect(sortTasks(TASKS, "priority-desc").map((t) => t.id)).toEqual(["b", "a", "d", "c"]);
    });

    it("sorts by title without case sensitivity", () => {
        const mixed = [
            makeTask({ id: "x", title: "banana" }),
            makeTask({ id: "y", title: "Apple" }),
        ];
        expect(sortTasks(mixed, "title-asc").map((t) => t.id)).toEqual(["y", "x"]);
    });

    it("does not mutate the input array", () => {
        const original = [...TASKS];
        sortTasks(TASKS, "title-asc");
        expect(TASKS).toEqual(original);
    });
});

describe("computeStats", () => {
    it("counts by status and derives a completion rate", () => {
        expect(computeStats(TASKS, NOW)).toEqual({
            total: 4,
            todo: 2,
            doing: 1,
            done: 1,
            overdue: 1,
            dueToday: 1,
            completionRate: 25,
        });
    });

    it("rounds the completion rate", () => {
        const tasks = [
            makeTask({ status: "done" }),
            makeTask({ status: "done" }),
            makeTask({ status: "todo" }),
        ];
        expect(computeStats(tasks, NOW).completionRate).toBe(67);
    });

    it("survives an empty list", () => {
        expect(computeStats([], NOW)).toEqual({
            total: 0,
            todo: 0,
            doing: 0,
            done: 0,
            overdue: 0,
            dueToday: 0,
            completionRate: 0,
        });
    });
});

describe("collectProjects and collectTags", () => {
    it("lists projects with Inbox first, then alphabetically", () => {
        expect(collectProjects(TASKS)).toEqual(["Inbox", "Engineering", "Reporting", "Travel"]);
    });

    it("de-duplicates and sorts tags", () => {
        const tasks = [makeTask({ tags: ["zeta", "alpha"] }), makeTask({ tags: ["alpha", "mu"] })];
        expect(collectTags(tasks)).toEqual(["alpha", "mu", "zeta"]);
    });

    it("returns empty lists when there is nothing to collect", () => {
        expect(collectProjects([])).toEqual([]);
        expect(collectTags([])).toEqual([]);
    });
});

describe("normalizeTags", () => {
    it("trims, lower cases and de-duplicates", () => {
        expect(normalizeTags([" Bug ", "bug", "MOBILE"])).toEqual(["bug", "mobile"]);
    });

    it("accepts a comma separated string", () => {
        expect(normalizeTags("design, ui , Design")).toEqual(["design", "ui"]);
    });

    it("drops empty entries", () => {
        expect(normalizeTags(["", "   ", "ok"])).toEqual(["ok"]);
    });
});

describe("createTask", () => {
    it("builds a fully populated task from a draft", () => {
        const task = createTask(
            makeDraft({
                title: "  Ship it  ",
                notes: "  notes  ",
                project: "",
                tags: ["Release"],
                dueDate: "2026-10-01",
            }),
            "new-id",
            "2026-09-26T10:00:00.000Z",
        );

        expect(task).toEqual({
            id: "new-id",
            title: "Ship it",
            notes: "notes",
            status: "todo",
            priority: "medium",
            dueDate: "2026-10-01",
            project: "Inbox",
            tags: ["release"],
            createdAt: "2026-09-26T10:00:00.000Z",
            updatedAt: "2026-09-26T10:00:00.000Z",
            completedAt: null,
        });
    });

    it("stamps completedAt when created as done", () => {
        const task = createTask(makeDraft({ status: "done" }), "id", "2026-09-26T10:00:00.000Z");
        expect(task.completedAt).toBe("2026-09-26T10:00:00.000Z");
    });
});

describe("due-date grouping", () => {
    const at = (days: number) => {
        const date = new Date(NOW);
        date.setDate(date.getDate() + days);
        return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
    };

    it("buckets a task by how far away its deadline is", () => {
        expect(dueGroupFor(makeTask({ dueDate: at(-1) }), NOW)).toBe("overdue");
        expect(dueGroupFor(makeTask({ dueDate: at(0) }), NOW)).toBe("today");
        expect(dueGroupFor(makeTask({ dueDate: at(1) }), NOW)).toBe("tomorrow");
        expect(dueGroupFor(makeTask({ dueDate: at(3) }), NOW)).toBe("week");
        expect(dueGroupFor(makeTask({ dueDate: at(30) }), NOW)).toBe("later");
        expect(dueGroupFor(makeTask({ dueDate: null }), NOW)).toBe("someday");
    });

    it("sinks finished work into completed even when it is late", () => {
        const late = makeTask({ status: "done", dueDate: at(-5) });
        expect(dueGroupFor(late, NOW)).toBe("completed");
    });

    it("returns sections in urgency order and drops empty ones", () => {
        const groups = groupTasksByDue(
            [
                makeTask({ id: "later", dueDate: at(30) }),
                makeTask({ id: "done", status: "done", dueDate: at(-2) }),
                makeTask({ id: "today", dueDate: at(0) }),
                makeTask({ id: "nodate", dueDate: null }),
                makeTask({ id: "overdue", dueDate: at(-3) }),
            ],
            NOW,
        );

        expect(groups.map((group) => group.id)).toEqual([
            "overdue",
            "today",
            "later",
            "someday",
            "completed",
        ]);
        expect(groups[0].tasks.map((task) => task.id)).toEqual(["overdue"]);
    });

    it("preserves the incoming order inside a section", () => {
        const groups = groupTasksByDue(
            [
                makeTask({ id: "t1", dueDate: at(0) }),
                makeTask({ id: "t2", dueDate: at(0) }),
                makeTask({ id: "t3", dueDate: at(0) }),
            ],
            NOW,
        );

        expect(groups[0].tasks.map((task) => task.id)).toEqual(["t1", "t2", "t3"]);
    });

    it("groups only for the due-date order, and reports the section labels", () => {
        expect(groupsByDue("due-asc")).toBe(true);
        expect(groupsByDue("due-desc")).toBe(false);
        expect(groupsByDue("priority-desc")).toBe(false);
        expect(groupsByDue("title-asc")).toBe(false);
        expect(groupTasksByDue([makeTask({ dueDate: at(0) })], NOW)[0].label).toBe("Today");
    });
});
