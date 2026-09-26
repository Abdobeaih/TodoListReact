import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { addDays, isValidISODate, todayISO, toISODate } from "../lib/date";
import { normalizeTags } from "../lib/tasks";
import {
    DEFAULT_PROJECT,
    EMPTY_DRAFT,
    PRIORITY_META,
    PRIORITY_OPTIONS,
    STATUS_OPTIONS,
    type Task,
    type TaskDraft,
    type TaskPriority,
    type TaskStatus,
} from "../types/task";

export type TaskFormTarget = { mode: "create" } | { mode: "edit"; task: Task };

interface TaskFormDialogProps {
    open: boolean;
    target: TaskFormTarget;
    projectOptions: string[];
    tagOptions: string[];
    onSubmit: (draft: TaskDraft, target: TaskFormTarget) => void;
    onClose: () => void;
}

function toDraft(target: TaskFormTarget): TaskDraft {
    if (target.mode === "create") return { ...EMPTY_DRAFT };
    const { task } = target;
    return {
        title: task.title,
        notes: task.notes,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        project: task.project,
        tags: task.tags,
    };
}

export function TaskFormDialog({
    open,
    target,
    projectOptions,
    tagOptions,
    onSubmit,
    onClose,
}: TaskFormDialogProps) {
    const [draft, setDraft] = useState<TaskDraft>(EMPTY_DRAFT);
    const [titleError, setTitleError] = useState("");
    const wasOpen = useRef(false);

    // Seed once per opening rather than on every render, so the form does not depend
    // on the parent keeping `target` referentially stable. It is a plain state object
    // today, but inlining it at the call site would silently wipe the user's typing.
    useEffect(() => {
        if (open && !wasOpen.current) {
            setDraft(toDraft(target));
            setTitleError("");
        }
        wasOpen.current = open;
    }, [open, target]);

    const set = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) =>
        setDraft((current) => ({ ...current, [key]: value }));

    const handleSubmit = (event?: FormEvent) => {
        event?.preventDefault();
        if (!draft.title.trim()) {
            setTitleError("Give the task a title so you can find it later.");
            return;
        }
        onSubmit(
            {
                ...draft,
                title: draft.title.trim(),
                notes: draft.notes.trim(),
                dueDate: draft.dueDate && isValidISODate(draft.dueDate) ? draft.dueDate : null,
                project: draft.project.trim() || DEFAULT_PROJECT,
                tags: normalizeTags(draft.tags),
            },
            target,
        );
    };

    // Enter submits from single-line fields; the notes field keeps Enter for newlines.
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Enter") return;
        const element = event.target as HTMLElement;
        if (element.tagName === "TEXTAREA") return;
        if (element.getAttribute("role") === "combobox") return;
        event.preventDefault();
        handleSubmit();
    };

    const today = todayISO();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            onKeyDown={handleKeyDown}
            aria-labelledby="task-form-title"
        >
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <DialogTitle id="task-form-title">
                    {target.mode === "create" ? "New task" : "Edit task"}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <TextField
                            autoFocus
                            required
                            fullWidth
                            label="Title"
                            placeholder="What needs to happen?"
                            value={draft.title}
                            error={titleError.length > 0}
                            helperText={titleError.length > 0 ? titleError : " "}
                            onChange={(event) => {
                                setDraft((current) => ({ ...current, title: event.target.value }));
                                if (titleError) setTitleError("");
                            }}
                        />

                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label="Notes"
                            placeholder="Context, links, acceptance criteria…"
                            value={draft.notes}
                            onChange={(event) => set("notes", event.target.value)}
                        />

                        <Box>
                            <Typography variant="overline" color="text.secondary">
                                Status
                            </Typography>
                            <ToggleButtonGroup
                                exclusive
                                fullWidth
                                size="small"
                                value={draft.status}
                                onChange={(_event, value: TaskStatus | null) => {
                                    if (value) set("status", value);
                                }}
                                sx={{ mt: 0.75 }}
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <ToggleButton key={option.value} value={option.value}>
                                        {option.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>

                        <Box>
                            <Typography variant="overline" color="text.secondary">
                                Priority
                            </Typography>
                            <ToggleButtonGroup
                                exclusive
                                fullWidth
                                size="small"
                                value={draft.priority}
                                onChange={(_event, value: TaskPriority | null) => {
                                    if (value) set("priority", value);
                                }}
                                sx={{ mt: 0.75 }}
                            >
                                {PRIORITY_OPTIONS.map((option) => (
                                    <ToggleButton key={option.value} value={option.value}>
                                        <Box
                                            component="span"
                                            aria-hidden
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                mr: 0.75,
                                                borderRadius: "50%",
                                                backgroundColor: `${PRIORITY_META[option.value].color}.main`,
                                            }}
                                        />
                                        {option.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>

                        <Box>
                            <Typography variant="overline" color="text.secondary">
                                Due date
                            </Typography>
                            <Stack spacing={1.25} sx={{ mt: 0.75 }}>
                                <TextField
                                    type="date"
                                    fullWidth
                                    label="Due date"
                                    value={draft.dueDate ?? ""}
                                    onChange={(event) => set("dueDate", event.target.value || null)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                    <Chip
                                        size="small"
                                        label="Today"
                                        clickable
                                        onClick={() => set("dueDate", today)}
                                    />
                                    <Chip
                                        size="small"
                                        label="Tomorrow"
                                        clickable
                                        onClick={() =>
                                            set("dueDate", toISODate(addDays(new Date(), 1)))
                                        }
                                    />
                                    <Chip
                                        size="small"
                                        label="Next week"
                                        clickable
                                        onClick={() =>
                                            set("dueDate", toISODate(addDays(new Date(), 7)))
                                        }
                                    />
                                    <Chip
                                        size="small"
                                        label="In two weeks"
                                        clickable
                                        onClick={() =>
                                            set("dueDate", toISODate(addDays(new Date(), 14)))
                                        }
                                    />
                                    <Chip
                                        size="small"
                                        label="Clear"
                                        clickable
                                        disabled={!draft.dueDate}
                                        onClick={() => set("dueDate", null)}
                                    />
                                </Stack>
                            </Stack>
                        </Box>

                        <Autocomplete
                            freeSolo
                            options={projectOptions}
                            inputValue={draft.project}
                            onInputChange={(_event, value) => set("project", value)}
                            renderInput={(params) => (
                                <TextField {...params} label="Project" placeholder="Inbox" />
                            )}
                        />

                        <Autocomplete
                            multiple
                            freeSolo
                            options={tagOptions}
                            value={draft.tags}
                            onChange={(_event, value) => set("tags", value as string[])}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tags"
                                    placeholder="Add a tag and press Enter"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((tag, index) => {
                                    const { key, ...chipProps } = getTagProps({ index });
                                    return (
                                        <Chip
                                            key={key}
                                            label={`#${tag}`}
                                            size="small"
                                            {...chipProps}
                                        />
                                    );
                                })
                            }
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} color="inherit">
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained">
                        {target.mode === "create" ? "Create task" : "Save changes"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
