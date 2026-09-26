import { describe, expect, it } from "vitest";
import {
    addDays,
    daysUntil,
    describeDueDate,
    formatFullDate,
    isValidISODate,
    parseISODate,
    toISODate,
    todayISO,
} from "./date";

const NOW = new Date(2026, 8, 26, 14, 30); // 26 Sep 2026, local time

describe("toISODate", () => {
    it("formats a local date without shifting across time zones", () => {
        expect(toISODate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
        expect(toISODate(new Date(2026, 11, 31, 0, 1))).toBe("2026-12-31");
    });

    it("pads single digit months and days", () => {
        expect(toISODate(new Date(2026, 8, 6))).toBe("2026-09-06");
    });
});

describe("parseISODate", () => {
    it("parses to local midnight", () => {
        const parsed = parseISODate("2026-09-26");
        expect(parsed).not.toBeNull();
        expect(parsed?.getFullYear()).toBe(2026);
        expect(parsed?.getMonth()).toBe(8);
        expect(parsed?.getDate()).toBe(26);
        expect(parsed?.getHours()).toBe(0);
    });

    it("rejects malformed input", () => {
        expect(parseISODate("26-09-2026")).toBeNull();
        expect(parseISODate("2026/09/26")).toBeNull();
        expect(parseISODate("")).toBeNull();
        expect(parseISODate(null)).toBeNull();
        expect(parseISODate(undefined)).toBeNull();
    });

    it("round-trips with toISODate", () => {
        expect(toISODate(parseISODate("2026-02-28") as Date)).toBe("2026-02-28");
    });
});

describe("isValidISODate", () => {
    it("accepts real calendar dates only", () => {
        expect(isValidISODate("2026-09-26")).toBe(true);
        expect(isValidISODate("2026-02-30")).toBe(false);
        expect(isValidISODate("2026-13-01")).toBe(false);
        expect(isValidISODate("not-a-date")).toBe(false);
    });
});

describe("daysUntil", () => {
    it("counts calendar days, not 24 hour spans", () => {
        expect(daysUntil("2026-09-26", NOW)).toBe(0);
        expect(daysUntil("2026-09-27", NOW)).toBe(1);
        expect(daysUntil("2026-09-25", NOW)).toBe(-1);
    });

    it("is negative for past dates", () => {
        expect(daysUntil("2026-09-19", NOW)).toBe(-7);
    });

    it("stays correct across a daylight saving boundary", () => {
        // Late March is when most northern-hemisphere zones shift their clocks.
        const beforeShift = new Date(2026, 2, 28, 12, 0);
        const afterShift = new Date(2026, 2, 30, 12, 0);
        expect(daysUntil("2026-03-29", beforeShift)).toBe(1);
        expect(daysUntil("2026-03-30", afterShift)).toBe(0);
    });

    it("returns NaN for unusable input", () => {
        expect(Number.isNaN(daysUntil("nope", NOW))).toBe(true);
    });
});

describe("describeDueDate", () => {
    it("describes today and tomorrow in words", () => {
        expect(describeDueDate("2026-09-26", NOW)).toEqual({
            label: "Due today",
            tone: "today",
            days: 0,
        });
        expect(describeDueDate("2026-09-27", NOW)).toEqual({
            label: "Due tomorrow",
            tone: "soon",
            days: 1,
        });
    });

    it("pluralises overdue days", () => {
        expect(describeDueDate("2026-09-25", NOW).label).toBe("1 day overdue");
        expect(describeDueDate("2026-09-23", NOW).label).toBe("3 days overdue");
        expect(describeDueDate("2026-09-23", NOW).tone).toBe("overdue");
    });

    it("treats a date inside the coming week as soon", () => {
        const display = describeDueDate("2026-10-02", NOW);
        expect(display.tone).toBe("soon");
        expect(display.label).toBe("Due in 6 days");
    });

    it("falls back to a calendar date beyond a week", () => {
        const display = describeDueDate("2026-12-25", NOW);
        expect(display.tone).toBe("later");
        expect(display.label).not.toMatch(/overdue|Due in/);
    });

    it("handles a missing or invalid date", () => {
        expect(describeDueDate(null, NOW).tone).toBe("none");
        expect(describeDueDate("garbage", NOW).tone).toBe("none");
    });
});

describe("addDays", () => {
    it("rolls over month boundaries", () => {
        expect(toISODate(addDays(new Date(2026, 8, 30), 3))).toBe("2026-10-03");
    });

    it("handles leap years", () => {
        expect(toISODate(addDays(new Date(2028, 1, 28), 1))).toBe("2028-02-29");
    });
});

describe("todayISO and formatFullDate", () => {
    it("reports today's local date", () => {
        expect(todayISO(NOW)).toBe("2026-09-26");
    });

    it("spells out a full date, and copes with null", () => {
        // The machine locale decides the numerals, so compare against the same locale.
        const locale = new Intl.DateTimeFormat().resolvedOptions().locale;
        const year = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(
            new Date(2026, 8, 26),
        );

        expect(formatFullDate("2026-09-26")).toContain(year);
        expect(formatFullDate("2026-09-26")).not.toBe("No due date");
        expect(formatFullDate(null)).toBe("No due date");
    });
});
