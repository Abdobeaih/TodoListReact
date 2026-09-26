import type { RefObject } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
    SORT_LABELS,
    countActiveFilters,
    type SortOption,
    type TaskFilters,
} from "../types/filters";
import { FilterPanel } from "./FilterPanel";

interface TaskToolbarProps {
    filters: TaskFilters;
    onChange: (next: TaskFilters) => void;
    filtersOpen: boolean;
    onToggleFilters: () => void;
    onNewTask: () => void;
    searchRef: RefObject<HTMLInputElement | null>;
}

export function TaskToolbar({
    filters,
    onChange,
    filtersOpen,
    onToggleFilters,
    onNewTask,
    searchRef,
}: TaskToolbarProps) {
    const activeCount = countActiveFilters(filters);
    const filtersActive = filtersOpen || activeCount > 0;

    return (
        <Box sx={{ mb: 2 }}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ sm: "center" }}
            >
                <TextField
                    inputRef={searchRef}
                    value={filters.query}
                    onChange={(event) => onChange({ ...filters, query: event.target.value })}
                    placeholder="Search tasks"
                    size="small"
                    fullWidth
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon fontSize="small" />
                                </InputAdornment>
                            ),
                            endAdornment: filters.query ? (
                                <InputAdornment position="end">
                                    <Tooltip title="Clear search">
                                        <IconButton
                                            size="small"
                                            aria-label="Clear search"
                                            onClick={() => onChange({ ...filters, query: "" })}
                                        >
                                            <CloseRoundedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            ) : null,
                        },
                    }}
                    sx={{ flex: 1, minWidth: 0 }}
                />

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <FormControl size="small" sx={{ minWidth: 168 }}>
                        <Select
                            value={filters.sort}
                            onChange={(event) =>
                                onChange({ ...filters, sort: event.target.value as SortOption })
                            }
                            displayEmpty
                            inputProps={{ "aria-label": "Sort tasks" }}
                        >
                            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                                <MenuItem key={option} value={option}>
                                    {SORT_LABELS[option]}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant={filtersActive ? "contained" : "outlined"}
                        color={filtersActive ? "primary" : "inherit"}
                        startIcon={<FilterAltRoundedIcon />}
                        onClick={onToggleFilters}
                        aria-expanded={filtersOpen}
                        aria-controls="task-filter-panel"
                    >
                        Filters
                        {activeCount > 0 ? ` (${activeCount})` : ""}
                    </Button>

                    <Tooltip title="New task (N)">
                        <Button
                            variant="contained"
                            startIcon={<AddRoundedIcon />}
                            onClick={onNewTask}
                        >
                            New task
                        </Button>
                    </Tooltip>
                </Stack>
            </Stack>

            <Collapse in={filtersOpen} unmountOnExit>
                <Box id="task-filter-panel" sx={{ mt: 1.5 }}>
                    <FilterPanel filters={filters} onChange={onChange} />
                </Box>
            </Collapse>
        </Box>
    );
}
