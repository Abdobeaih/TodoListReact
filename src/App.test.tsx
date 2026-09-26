import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { makeTask, seedTasks } from "./test/factories";
import { setupUser } from "./test/renderDashboard";

describe("App", () => {
    it("boots the shell, the stats and the task list together", async () => {
        seedTasks([
            makeTask({ id: "a", title: "Write the report" }),
            makeTask({ id: "b", title: "Book flights", status: "done" }),
        ]);

        render(<App />);

        expect(await screen.findByText("TaskFlow")).toBeInTheDocument();
        expect(screen.getByText("Write the report")).toBeInTheDocument();
        expect(screen.getByText("Book flights")).toBeInTheDocument();
        expect(screen.getByText("Overall progress")).toBeInTheDocument();
    });

    it("seeds sample tasks on a first run so the app is never blank", async () => {
        render(<App />);

        expect(await screen.findByText(/Showing \d+ of \d+ tasks/)).toBeInTheDocument();
        expect(screen.queryByText("No tasks yet")).not.toBeInTheDocument();
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
        expect(css).toMatch(/--mui-palette-background-default:\s*#f6f6fb/i);
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
