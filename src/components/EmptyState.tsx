import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 1.5,
                px: 3,
                py: { xs: 5, sm: 7 },
            }}
        >
            <Box
                aria-hidden
                sx={{
                    display: "grid",
                    placeItems: "center",
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    color: "primary.main",
                    backgroundColor: "action.selected",
                }}
            >
                {icon}
            </Box>
            <Typography variant="h4">{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                {description}
            </Typography>
            {action}
        </Box>
    );
}
