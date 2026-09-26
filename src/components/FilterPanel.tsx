import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTaskStore } from "../store/taskStoreContext";
import { collectProjects, collectTags } from "../lib/tasks";
import { DEFAULT_PROJECT, PRIORITY_META, PRIORITY_OPTIONS, STATUS_OPTIONS } from "../types/task";
import {
    DEFAULT_FILTERS,
    DUE_FILTER_LABELS,
    countActiveFilters,
    type DueFilter,
    type TaskFilters,
} from "../types/filters";

interface FilterPanelProps {
    filters: TaskFilters;
    onChange: (next: TaskFilters) => void;
}

function toggleValue(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

interface FilterRowProps {
    label: string;
    children: ReactNode;
}

function FilterRow({ label, children }: FilterRowProps) {
    return (
        <Box>
            <Typography variant="overline" color="text.secondary">
                {label}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
                {children}
            </Stack>
        </Box>
    );
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
    const { tasks } = useTaskStore();
    const projects = collectProjects(tasks);
    const tags = collectTags(tasks);
    const activeCount = countActiveFilters(filters);

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                border: "1px solid var(--mui-palette-divider)",
                backgroundColor: "background.paper",
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
            >
                <Typography variant="subtitle1">Filters</Typography>
                <Button
                    size="small"
                    color="inherit"
                    disabled={activeCount === 0}
                    onClick={() => onChange({ ...DEFAULT_FILTERS, sort: filters.sort })}
                >
                    Clear all
                </Button>
            </Stack>

            <Stack spacing={2.25}>
                <FilterRow label="Status">
                    {STATUS_OPTIONS.map((option) => {
                        const selected = filters.statuses.includes(option.value);
                        return (
                            <Chip
                                key={option.value}
                                label={option.label}
                                size="small"
                                clickable
                                color={selected ? "primary" : "default"}
                                variant={selected ? "filled" : "outlined"}
                                onClick={() =>
                                    onChange({
                                        ...filters,
                                        statuses: toggleValue(filters.statuses, option.value),
                                    })
                                }
                            />
                        );
                    })}
                </FilterRow>

                <FilterRow label="Priority">
                    {PRIORITY_OPTIONS.map((option) => {
                        const selected = filters.priorities.includes(option.value);
                        return (
                            <Chip
                                key={option.value}
                                label={option.label}
                                size="small"
                                clickable
                                color={selected ? PRIORITY_META[option.value].color : "default"}
                                variant={selected ? "filled" : "outlined"}
                                onClick={() =>
                                    onChange({
                                        ...filters,
                                        priorities: toggleValue(filters.priorities, option.value),
                                    })
                                }
                            />
                        );
                    })}
                </FilterRow>

                <FilterRow label="Due date">
                    {(Object.keys(DUE_FILTER_LABELS) as DueFilter[]).map((option) => {
                        const selected = filters.due === option;
                        return (
                            <Chip
                                key={option}
                                label={DUE_FILTER_LABELS[option]}
                                size="small"
                                clickable
                                color={selected ? "primary" : "default"}
                                variant={selected ? "filled" : "outlined"}
                                onClick={() => onChange({ ...filters, due: option })}
                            />
                        );
                    })}
                </FilterRow>

                {projects.length > 1 && (
                    <FilterRow label="Project">
                        {projects.map((project) => {
                            const selected = filters.projects.includes(project);
                            return (
                                <Chip
                                    key={project}
                                    label={project === DEFAULT_PROJECT ? "No project" : project}
                                    size="small"
                                    clickable
                                    color={selected ? "secondary" : "default"}
                                    variant={selected ? "filled" : "outlined"}
                                    onClick={() =>
                                        onChange({
                                            ...filters,
                                            projects: toggleValue(filters.projects, project),
                                        })
                                    }
                                />
                            );
                        })}
                    </FilterRow>
                )}

                {tags.length > 0 && (
                    <>
                        <Divider />
                        <FilterRow label="Tags">
                            {tags.map((tag) => {
                                const selected = filters.tags.includes(tag);
                                return (
                                    <Chip
                                        key={tag}
                                        label={`#${tag}`}
                                        size="small"
                                        clickable
                                        color={selected ? "secondary" : "default"}
                                        variant={selected ? "filled" : "outlined"}
                                        onClick={() =>
                                            onChange({
                                                ...filters,
                                                tags: toggleValue(filters.tags, tag),
                                            })
                                        }
                                    />
                                );
                            })}
                        </FilterRow>
                    </>
                )}
            </Stack>

            {activeCount > 0 && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 2 }}
                >
                    {activeCount} {activeCount === 1 ? "filter" : "filters"} applied
                </Typography>
            )}
        </Box>
    );
}
