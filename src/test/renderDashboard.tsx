import type { ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackProvider } from "../components/FeedbackProvider";
import { TaskProvider } from "../store/TaskProvider";
import { TaskDashboard } from "../components/TaskDashboard";

/** Renders the dashboard inside the same provider stack the real app uses. */
export function renderDashboard(options?: RenderOptions): ReturnType<typeof render> {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <FeedbackProvider>
                <TaskProvider>{children}</TaskProvider>
            </FeedbackProvider>
        );
    }

    return render(<TaskDashboard />, { ...options, wrapper: Wrapper });
}

/**
 * MUI tooltips render a popper under the pointer, which trips user-event's
 * pointer-events guard on rapid repeat clicks even though the click lands fine.
 * Note: `delay: null` is tempting here but starves React's render flush and makes
 * the suite an order of magnitude slower.
 */
export function setupUser() {
    return userEvent.setup({ pointerEventsCheck: 0 });
}
