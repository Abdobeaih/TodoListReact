export type DueFilter = "any" | "overdue" | "today" | "week" | "no-date";
export type SortOption =
    "due-asc" | "due-desc" | "priority-desc" | "created-desc" | "created-asc" | "title-asc";

export interface TaskFilters {
    query: string;
    statuses: string[];
    priorities: string[];
    projects: string[];
    tags: string[];
    due: DueFilter;
    sort: SortOption;
}

export const DEFAULT_FILTERS: TaskFilters = {
    query: "",
    statuses: [],
    priorities: [],
    projects: [],
    tags: [],
    due: "any",
    sort: "due-asc",
};

export const DUE_FILTER_LABELS: Record<DueFilter, string> = {
    any: "Any due date",
    overdue: "Overdue",
    today: "Due today",
    week: "Next 7 days",
    "no-date": "No due date",
};

export const SORT_LABELS: Record<SortOption, string> = {
    "due-asc": "Due date (soonest first)",
    "due-desc": "Due date (latest first)",
    "priority-desc": "Priority (highest first)",
    "created-desc": "Newest first",
    "created-asc": "Oldest first",
    "title-asc": "Title (A to Z)",
};

/** Number of user-applied constraints, used for the "Filters (n)" badge. */
export function countActiveFilters(filters: TaskFilters): number {
    let count = 0;
    if (filters.query.trim().length > 0) count += 1;
    count += filters.statuses.length > 0 ? 1 : 0;
    count += filters.priorities.length > 0 ? 1 : 0;
    count += filters.projects.length > 0 ? 1 : 0;
    count += filters.tags.length > 0 ? 1 : 0;
    count += filters.due !== DEFAULT_FILTERS.due ? 1 : 0;
    return count;
}
