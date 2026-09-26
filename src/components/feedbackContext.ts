import { createContext, useContext } from "react";

export type FeedbackTone = "success" | "info" | "warning" | "error";

export interface FeedbackAction {
    label: string;
    onClick: () => void;
}

export interface FeedbackOptions {
    tone?: FeedbackTone;
    action?: FeedbackAction;
    durationMs?: number;
}

export interface FeedbackMessage {
    id: string;
    message: string;
    tone: FeedbackTone;
    action?: FeedbackAction;
    durationMs: number;
}

export interface FeedbackValue {
    /** Queues a message. Safe to call from event handlers and effects. */
    notify: (message: string, options?: FeedbackOptions) => void;
}

export const FeedbackContext = createContext<FeedbackValue | null>(null);

export function useFeedback(): FeedbackValue {
    const feedback = useContext(FeedbackContext);
    if (!feedback) {
        throw new Error("useFeedback must be used inside <FeedbackProvider>");
    }
    return feedback;
}
