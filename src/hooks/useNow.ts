import { useEffect, useState } from "react";

/**
 * Returns a Date that refreshes on an interval, so relative labels such as
 * "2 days overdue" stay accurate without the user reloading the page.
 */
export function useNow(intervalMs = 60_000): Date {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), intervalMs);
        return () => window.clearInterval(timer);
    }, [intervalMs]);

    return now;
}
