import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { forwardRef } from "react";

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function SlideTransition(props) {
    return <Slide {...props} direction="left" />;
}

export default function MySnackBar({ open, message, Close }) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={2000}
            onClose={Close}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            TransitionComponent={SlideTransition}
        >
            <Alert onClose={Close} severity="success">
                {message}
            </Alert>
        </Snackbar>
    );
}
