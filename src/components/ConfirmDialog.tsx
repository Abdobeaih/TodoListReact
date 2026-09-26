import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel = "Cancel",
    destructive = false,
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            aria-labelledby="confirm-dialog-title"
        >
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText variant="body2">{description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    {cancelLabel}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={destructive ? "error" : "primary"}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
