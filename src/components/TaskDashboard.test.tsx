import { describe, expect, it, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import { makeTask, readStoredTasks, seedTasks } from "../test/factories";
import { renderDashboard, setupUser } from "../test/renderDashboard";

function filterPanel() {
    const panel = document.getElementById("task-filter-panel");
    if (!panel) throw new Error("Filter panel is not open");
    return within(panel);
}

function isoYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

describe("TaskDashboard", () => {
    it("renders the tasks that were persisted", async () => {
        seedTasks([
            makeTask({ id: "a", title: "Write the report" }),
            makeTask({ id: "b", title: "Book flights" }),
        ]);

        renderDashboard();

        expect(await screen.findByText("Write the report")).toBeInTheDocument();
        expect(screen.getByText("Book flights")).toBeInTheDocument();
        expect(screen.getByText("Showing 2 of 2 tasks")).toBeInTheDocument();
    });

    it("creates a task through the dialog and persists it", async () => {
        const user = setupUser();
        seedTasks([]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: /New task/ }));

        const dialog = await screen.findByRole("dialog", { name: "New task" });
        await user.type(within(dialog).getByLabelText(/Title/), "Draft the roadmap");
        await user.click(within(dialog).getByRole("button", { name: "Create task" }));

        expect(await screen.findByText("Draft the roadmap")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByRole("dialog", { name: "New task" })).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(readStoredTasks()?.map((task) => task.title)).toEqual(["Draft the roadmap"]);
        });
    });

    it("refuses to create a task without a title", async () => {
        const user = setupUser();
        seedTasks([]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: /New task/ }));
        const dialog = await screen.findByRole("dialog", { name: "New task" });
        await user.click(within(dialog).getByRole("button", { name: "Create task" }));

        expect(
            await within(dialog).findByText("Give the task a title so you can find it later."),
        ).toBeInTheDocument();
        expect(readStoredTasks()).toHaveLength(0);
    });

    it("saves every field captured in the dialog", async () => {
        const user = setupUser();
        seedTasks([]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: /New task/ }));
        const dialog = await screen.findByRole("dialog", { name: "New task" });

        await user.type(within(dialog).getByLabelText(/^Title/), "Ship the release");
        await user.type(within(dialog).getByLabelText(/^Notes/), "Tag the build first");
        await user.click(within(dialog).getByRole("button", { name: "Urgent" }));
        await user.click(within(dialog).getByRole("button", { name: "Next week" }));
        await user.type(within(dialog).getByLabelText(/Project/), "Engineering");
        await user.type(within(dialog).getByRole("combobox", { name: /Tags/ }), "release{Enter}");
        await user.click(within(dialog).getByRole("button", { name: "Create task" }));

        await waitFor(() => {
            expect(readStoredTasks()?.[0]).toMatchObject({
                title: "Ship the release",
                notes: "Tag the build first",
                priority: "urgent",
                project: "Engineering",
                tags: ["release"],
            });
        });
        expect(readStoredTasks()?.[0].dueDate).toBeTruthy();
    });

    it("edits an existing task and keeps its identity", async () => {
        const user = setupUser();
        seedTasks([makeTask({ id: "a", title: "Old title", notes: "Old notes" })]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: 'Edit "Old title"' }));

        const dialog = await screen.findByRole("dialog", { name: "Edit task" });
        const title = within(dialog).getByLabelText(/Title/);
        await user.clear(title);
        await user.type(title, "New title");
        await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

        expect(await screen.findByText("New title")).toBeInTheDocument();
        await waitFor(() => {
            expect(readStoredTasks()).toHaveLength(1);
        });
        expect(readStoredTasks()?.[0].id).toBe("a");
        expect(readStoredTasks()?.[0].notes).toBe("Old notes");
    });

    it("keeps in-progress typing when the dashboard re-renders", async () => {
        const user = setupUser();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        seedTasks([makeTask({ id: "a", title: "Write the report" })]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: 'Edit "Write the report"' }));
        const dialog = await screen.findByRole("dialog", { name: "Edit task" });
        const title = within(dialog).getByLabelText(/Title/);
        await user.clear(title);
        await user.type(title, "Half-typed title");

        // The relative-date ticker re-renders the dashboard under the open dialog.
        // Typing must survive that.
        await act(async () => {
            vi.advanceTimersByTime(60_000);
        });

        expect(within(dialog).getByLabelText(/Title/)).toHaveValue("Half-typed title");
    });

    it("re-seeds the form when a different task is opened", async () => {
        const user = setupUser();
        seedTasks([
            makeTask({ id: "a", title: "First task" }),
            makeTask({ id: "b", title: "Second task", notes: "Second notes" }),
        ]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: 'Edit "First task"' }));
        let dialog = await screen.findByRole("dialog", { name: "Edit task" });
        expect(within(dialog).getByLabelText(/Notes/)).toHaveValue("");

        await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

        // The modal restores the background to the accessibility tree on close,
        // so wait for that before reaching for a background control.
        const editSecond = await screen.findByRole("button", { name: 'Edit "Second task"' });
        await user.click(editSecond);

        dialog = await screen.findByRole("dialog", { name: "Edit task" });
        expect(within(dialog).getByLabelText(/Title/)).toHaveValue("Second task");
        expect(within(dialog).getByLabelText(/Notes/)).toHaveValue("Second notes");
    });

    it("cycles a task through todo, in progress and done", async () => {
        const user = setupUser();
        seedTasks([makeTask({ id: "a", title: "Write the report", status: "todo" })]);
        renderDashboard();

        await user.click(
            screen.getByRole("button", { name: 'Mark "Write the report" as In progress' }),
        );
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: 'Mark "Write the report" as Completed' }),
            ).toBeInTheDocument();
        });

        await user.click(
            screen.getByRole("button", { name: 'Mark "Write the report" as Completed' }),
        );
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: 'Mark "Write the report" as To do' }),
            ).toBeInTheDocument();
        });

        expect(readStoredTasks()?.[0].status).toBe("done");
    });

    it("records when a task was completed and clears the stamp when reopened", async () => {
        const user = setupUser();
        seedTasks([makeTask({ id: "a", title: "Write the report", status: "todo" })]);
        renderDashboard();

        await user.click(
            screen.getByRole("button", { name: 'Mark "Write the report" as In progress' }),
        );
        await user.click(
            screen.getByRole("button", { name: 'Mark "Write the report" as Completed' }),
        );

        await waitFor(() => {
            expect(readStoredTasks()?.[0].completedAt).toBeTruthy();
        });

        await user.click(screen.getByRole("button", { name: 'Mark "Write the report" as To do' }));
        await waitFor(() => {
            expect(readStoredTasks()?.[0].completedAt).toBeNull();
        });
    });

    it("searches across the visible tasks", async () => {
        const user = setupUser();
        seedTasks([
            makeTask({ id: "a", title: "Write the report" }),
            makeTask({ id: "b", title: "Book flights" }),
        ]);
        renderDashboard();

        await user.type(screen.getByPlaceholderText(/Search title/), "flights");

        expect(await screen.findByText("Showing 1 of 2 tasks")).toBeInTheDocument();
        expect(screen.getByText("Book flights")).toBeInTheDocument();
        expect(screen.queryByText("Write the report")).not.toBeInTheDocument();
    });

    it("offers a way out when nothing matches the filters", async () => {
        const user = setupUser();
        seedTasks([makeTask({ id: "a", title: "Write the report" })]);
        renderDashboard();

        await user.type(screen.getByPlaceholderText(/Search title/), "nothing matches this");

        expect(await screen.findByText("No tasks match your filters")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Clear filters" }));
        expect(await screen.findByText("Write the report")).toBeInTheDocument();
    });

    it("filters by status from the filter panel", async () => {
        const user = setupUser();
        seedTasks([
            makeTask({ id: "a", title: "Write the report", status: "doing" }),
            makeTask({ id: "b", title: "Book flights", status: "todo" }),
        ]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: /^Filters/ }));
        await user.click(filterPanel().getByRole("button", { name: "In progress" }));

        expect(await screen.findByText("Showing 1 of 2 tasks")).toBeInTheDocument();
        expect(screen.getByText("Write the report")).toBeInTheDocument();
        expect(screen.queryByText("Book flights")).not.toBeInTheDocument();
    });

    it("filters overdue work from the stats tiles", async () => {
        const user = setupUser();
        seedTasks([
            makeTask({ id: "a", title: "Late task", dueDate: isoYesterday() }),
            makeTask({ id: "b", title: "Future task", dueDate: null }),
        ]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: /Overdue/ }));

        expect(await screen.findByText("Showing 1 of 2 tasks")).toBeInTheDocument();
        expect(screen.getByText("Late task")).toBeInTheDocument();
        expect(screen.queryByText("Future task")).not.toBeInTheDocument();
    });

    it("deletes a task after confirmation and can undo it", async () => {
        const user = setupUser();
        seedTasks([
            makeTask({ id: "a", title: "Write the report" }),
            makeTask({ id: "b", title: "Book flights" }),
        ]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: 'More actions for "Book flights"' }));
        await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

        const dialog = await screen.findByRole("dialog", { name: "Delete this task?" });
        await user.click(within(dialog).getByRole("button", { name: "Delete" }));

        await waitFor(() => {
            expect(screen.queryByText("Book flights")).not.toBeInTheDocument();
        });
        expect(readStoredTasks()?.map((task) => task.title)).toEqual(["Write the report"]);

        await user.click(await screen.findByRole("button", { name: "Undo" }));

        expect(await screen.findByText("Book flights")).toBeInTheDocument();
        expect(readStoredTasks()?.map((task) => task.title)).toEqual([
            "Write the report",
            "Book flights",
        ]);
    });

    it("keeps a task when the delete dialog is dismissed", async () => {
        const user = setupUser();
        seedTasks([makeTask({ id: "a", title: "Write the report" })]);
        renderDashboard();

        await user.click(
            screen.getByRole("button", { name: 'More actions for "Write the report"' }),
        );
        await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

        const dialog = await screen.findByRole("dialog", { name: "Delete this task?" });
        await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

        expect(await screen.findByText("Write the report")).toBeInTheDocument();
        expect(readStoredTasks()).toHaveLength(1);
    });

    it("clears completed tasks in bulk and offers an undo", async () => {
        const user = setupUser();
        seedTasks([
            makeTask({ id: "a", title: "Already done", status: "done" }),
            makeTask({ id: "b", title: "Still open", status: "todo" }),
        ]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: "Clear completed" }));

        await waitFor(() => {
            expect(screen.queryByText("Already done")).not.toBeInTheDocument();
        });
        expect(screen.getByText("Still open")).toBeInTheDocument();

        await user.click(await screen.findByRole("button", { name: "Undo" }));
        expect(await screen.findByText("Already done")).toBeInTheDocument();
    });

    it("filters by clicking a project chip on a task", async () => {
        const user = setupUser();
        seedTasks([
            makeTask({ id: "a", title: "Report", project: "Reporting" }),
            makeTask({ id: "b", title: "Flights", project: "Travel" }),
        ]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: "Reporting" }));

        expect(await screen.findByText("Showing 1 of 2 tasks")).toBeInTheDocument();
        expect(screen.queryByText("Flights")).not.toBeInTheDocument();
    });

    it("changes priority from the task menu", async () => {
        const user = setupUser();
        seedTasks([makeTask({ id: "a", title: "Report", priority: "low" })]);
        renderDashboard();

        await user.click(screen.getByRole("button", { name: 'Change priority of "Report"' }));
        await user.click(await screen.findByRole("menuitem", { name: "Urgent" }));

        await waitFor(() => {
            expect(readStoredTasks()?.[0].priority).toBe("urgent");
        });
    });

    it("opens the create dialog with the N shortcut and focuses search with /", async () => {
        const user = setupUser();
        seedTasks([]);
        renderDashboard();

        await user.keyboard("n");
        expect(await screen.findByRole("dialog", { name: "New task" })).toBeInTheDocument();

        await user.keyboard("{Escape}");
        await waitFor(() => {
            expect(screen.queryByRole("dialog", { name: "New task" })).not.toBeInTheDocument();
        });

        await user.keyboard("/");
        expect(screen.getByPlaceholderText(/Search title/)).toHaveFocus();
    });

    it("invites the user to create a task when the list is empty", async () => {
        seedTasks([]);
        renderDashboard();

        expect(await screen.findByText("No tasks yet")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Create a task" })).toBeInTheDocument();
    });
});
