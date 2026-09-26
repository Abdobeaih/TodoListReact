import { useCallback, useMemo, useState, type ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import { createId } from "../lib/id";
import {
    FeedbackContext,
    type FeedbackAction,
    type FeedbackMessage,
    type FeedbackOptions,
    type FeedbackTone,
} from "./feedbackContext";

const DEFAULT_DURATION = 3500;
const ACTION_DURATION = 6000;

export function FeedbackProvider({ children }: { children: ReactNode }) {
    const [queue, setQueue] = useState<FeedbackMessage[]>([]);

    const notify = useCallback((message: string, options?: FeedbackOptions) => {
        setQueue((previous) => [
            ...previous,
            {
                id: createId(),
                message,
                tone: options?.tone ?? "success",
                action: options?.action,
                // An undo affordance needs longer on screen than a plain confirmation.
                durationMs:
                    options?.durationMs ?? (options?.action ? ACTION_DURATION : DEFAULT_DURATION),
            },
        ]);
    }, []);

    const dismiss = useCallback(() => {
        setQueue((previous) => previous.slice(1));
    }, []);

    const runAction = useCallback(
        (action: FeedbackAction) => {
            action.onClick();
            dismiss();
        },
        [dismiss],
    );

    const value = useMemo(() => ({ notify }), [notify]);
    const current = queue[0];

    return (
        <FeedbackContext.Provider value={value}>
            {children}
            <Snackbar
                key={current?.id}
                open={Boolean(current)}
                autoHideDuration={current?.durationMs ?? DEFAULT_DURATION}
                onClose={(_event, reason) => {
                    if (reason === "clickaway") return;
                    dismiss();
                }}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                TransitionComponent={Slide}
            >
                <Alert
                    severity={(current?.tone ?? "success") satisfies FeedbackTone}
                    variant="filled"
                    onClose={dismiss}
                    action={
                        current?.action ? (
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => runAction(current.action as FeedbackAction)}
                                sx={{ fontWeight: 700, letterSpacing: "0.04em" }}
                            >
                                {current.action.label}
                            </Button>
                        ) : undefined
                    }
                    sx={{ width: "100%" }}
                >
                    {current?.message ?? ""}
                </Alert>
            </Snackbar>
        </FeedbackContext.Provider>
    );
}
