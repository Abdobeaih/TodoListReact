import type { RefObject } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
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
import SortRoundedIcon from "@mui/icons-material/SortRounded";
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

    return (
        <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ md: "center" }}
            >
                <TextField
                    inputRef={searchRef}
                    value={filters.query}
                    onChange={(event) => onChange({ ...filters, query: event.target.value })}
                    placeholder="Search title, notes, project or tag"
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
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                            value={filters.sort}
                            onChange={(event) =>
                                onChange({ ...filters, sort: event.target.value as SortOption })
                            }
                            displayEmpty
                            startAdornment={
                                <SortRoundedIcon
                                    fontSize="small"
                                    sx={{ mr: 1, color: "text.secondary" }}
                                />
                            }
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
                        variant={filtersOpen || activeCount > 0 ? "contained" : "outlined"}
                        color={filtersOpen || activeCount > 0 ? "primary" : "inherit"}
                        startIcon={<FilterAltRoundedIcon />}
                        onClick={onToggleFilters}
                        aria-expanded={filtersOpen}
                        aria-controls="task-filter-panel"
                    >
                        Filters
                        {activeCount > 0 ? ` (${activeCount})` : ""}
                    </Button>

                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onNewTask}>
                        New task
                    </Button>
                </Stack>
            </Stack>

            <Collapse in={filtersOpen} unmountOnExit>
                <Box id="task-filter-panel" sx={{ mt: 2 }}>
                    <FilterPanel filters={filters} onChange={onChange} />
                </Box>
            </Collapse>
        </Card>
    );
}
