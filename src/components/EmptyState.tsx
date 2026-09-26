import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

/**
 * Left-aligned and compact. A first-run screen is a sentence, not a poster, so the icon
 * sits inline with the copy instead of floating above it in a decorative box.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Stack
            direction="row"
            alignItems="flex-start"
            spacing={1.5}
            sx={{
                px: 1,
                py: { xs: 3, sm: 4 },
                maxWidth: 480,
            }}
        >
            <Box aria-hidden sx={{ color: "text.disabled", display: "flex", mt: 0.3 }}>
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1">{title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {description}
                </Typography>
                {action && <Box sx={{ mt: 1.5 }}>{action}</Box>}
            </Box>
        </Stack>
    );
}
