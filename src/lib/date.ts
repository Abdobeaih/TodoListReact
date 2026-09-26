const MS_PER_DAY = 86_400_000;

/** Formats a Date as a local `YYYY-MM-DD` string (never UTC-shifted). */
export function toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function todayISO(now: Date = new Date()): string {
    return toISODate(now);
}

/** Parses `YYYY-MM-DD` into local midnight, or null when the input is unusable. */
export function parseISODate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (Number.isNaN(date.getTime())) return null;
    return date;
}

export function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

/** Whole calendar days from today to `iso`. Negative means the date is in the past. */
export function daysUntil(iso: string, now: Date = new Date()): number {
    const target = parseISODate(iso);
    if (!target) return Number.NaN;
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target.getTime() - startOfToday.getTime()) / MS_PER_DAY);
}

export type DueTone = "overdue" | "today" | "soon" | "later" | "none";

export interface DueDisplay {
    label: string;
    tone: DueTone;
    /** Signed day count, useful for tooltips and screen readers. */
    days: number;
}

const dayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
});

/** Human-friendly due date copy: "Overdue by 3 days", "Today", "Tomorrow", "Fri, Sep 12". */
export function describeDueDate(iso: string | null, now: Date = new Date()): DueDisplay {
    if (!iso) return { label: "No due date", tone: "none", days: Number.NaN };
    const target = parseISODate(iso);
    if (!target) return { label: "No due date", tone: "none", days: Number.NaN };

    const days = daysUntil(iso, now);
    if (days === 0) return { label: "Due today", tone: "today", days };
    if (days === 1) return { label: "Due tomorrow", tone: "soon", days };
    if (days === -1) return { label: "1 day overdue", tone: "overdue", days };
    if (days < -1) return { label: `${Math.abs(days)} days overdue`, tone: "overdue", days };
    if (days <= 7) return { label: `Due in ${days} days`, tone: "soon", days };
    return { label: dayFormatter.format(target), tone: "later", days };
}

/** Full date for tooltips and aria labels, e.g. "Friday, September 12, 2026". */
export function formatFullDate(iso: string | null): string {
    const target = parseISODate(iso);
    if (!target) return "No due date";
    return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(target);
}

export function isValidISODate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = parseISODate(value);
    return parsed !== null && toISODate(parsed) === value;
}
