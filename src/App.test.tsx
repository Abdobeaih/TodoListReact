import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { makeTask, seedTasks } from "./test/factories";
import { setupUser } from "./test/renderDashboard";

describe("App", () => {
    it("boots the shell, the summary and the task list together", async () => {
        seedTasks([
            makeTask({ id: "a", title: "Write the report" }),
            makeTask({ id: "b", title: "Book flights", status: "done" }),
        ]);

        render(<App />);

        expect(await screen.findByText("TaskFlow")).toBeInTheDocument();
        expect(screen.getByText("Write the report")).toBeInTheDocument();
        expect(screen.getByText("Book flights")).toBeInTheDocument();
        expect(screen.getByText("1 of 2 done")).toBeInTheDocument();
    });

    it("opens empty on a first run instead of inventing tasks", async () => {
        render(<App />);

        expect(await screen.findByText("No tasks yet")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Add your first task" })).toBeInTheDocument();
        // The progress summary has nothing to measure, so it stays out of the way.
        expect(screen.queryByLabelText("Task completion")).not.toBeInTheDocument();
    });

    it("groups tasks by how soon they are due", async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const iso = `${yesterday.getFullYear()}-${`${yesterday.getMonth() + 1}`.padStart(2, "0")}-${`${yesterday.getDate()}`.padStart(2, "0")}`;

        seedTasks([
            makeTask({ id: "a", title: "Late task", dueDate: iso }),
            makeTask({ id: "b", title: "Undated task" }),
        ]);

        render(<App />);

        expect(await screen.findByRole("region", { name: "Overdue" })).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "No date" })).toBeInTheDocument();
    });

    it("switches colour scheme and remembers the choice", async () => {
        const user = setupUser();
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        seedTasks([]);
        render(<App />);

        const toggle = await screen.findByRole("button", { name: "Switch to dark theme" });
        await user.click(toggle);

        expect(
            await screen.findByRole("button", { name: "Switch to light theme" }),
        ).toBeInTheDocument();
        expect(document.documentElement.getAttribute("data-mui-color-scheme")).toBe("dark");
        await waitFor(() => {
            expect(window.localStorage.getItem("taskflow.colorMode")).toBe("dark");
        });

        await user.click(screen.getByRole("button", { name: "Switch to light theme" }));
        expect(document.documentElement.getAttribute("data-mui-color-scheme")).toBe("light");
        await waitFor(() => {
            expect(window.localStorage.getItem("taskflow.colorMode")).toBe("light");
        });

        // Guards against a silent regression to the "media" selector, where the
        // button keeps working while the page itself never changes.
        const warnings = consoleError.mock.calls
            .map((call) => String(call[0]))
            .filter((message) => message.includes("setMode"));
        expect(warnings).toEqual([]);
    });

    it("emits scoped CSS variables for both colour schemes", async () => {
        render(<App />);
        await screen.findByText("TaskFlow");

        const css = [...document.querySelectorAll("style")]
            .map((node) => node.textContent ?? "")
            .join("\n");

        // Light is the default on :root, dark is applied through the data attribute.
        expect(css).toMatch(/\[data-mui-color-scheme=["']?dark["']?\]/);
        expect(css).toMatch(/--mui-palette-background-default:\s*#0e1016/i);
        expect(css).toMatch(/--mui-palette-background-default:\s*#fafafb/i);
    });

    it("migrates tasks saved by the previous version", async () => {
        window.localStorage.setItem(
            "todos",
            JSON.stringify([
                {
                    id: "legacy-1",
                    title: "Read Book",
                    details: "Tesla Electrical Book",
                    Incomplete: true,
                },
                { id: "legacy-2", title: "WorkOut", details: "Go Gym", Incomplete: false },
            ]),
        );

        render(<App />);

        expect(await screen.findByText("Read Book")).toBeInTheDocument();
        expect(screen.getByText("Tesla Electrical Book")).toBeInTheDocument();
        expect(screen.getByText("WorkOut")).toBeInTheDocument();
    });
});
