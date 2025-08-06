import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
// Icon Importing ToDo
import CheckIcon from "@mui/icons-material/Check";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useContext } from "react";
import { ToastContext } from "../Context/ToastContext";
import { useTodosDispatch } from "../Context/ToDosContext";

export default function ToDo({ todo, showDelete, ShowUpdate }) {
    const dispatch = useTodosDispatch();
    const { ShowHiddenOpenToast } = useContext(ToastContext);
    function handelDeleteClick() {
        showDelete(todo);
    }
    function handelUpdateClick() {
        ShowUpdate(todo);
    }

    //  Handel Click Event End

    return (
        <>
            <Card
                className="card"
                sx={{
                    minWidth: 275,
                    backgroundColor: "#2385a3",
                    color: "white",
                    mb: 2,
                }}
            >
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={8}>
                            <Typography
                                variant="h5"
                                sx={{
                                    textAlign: "left",
                                    textDecoration: todo.isCompleted
                                        ? "line-through"
                                        : "none",
                                }}
                            >
                                {todo.title}
                            </Typography>
                            <Typography variant="h6" sx={{ textAlign: "left" }}>
                                {todo.details}
                            </Typography>
                        </Grid>
                        {/* Icon Action  */}
                        <Grid
                            size={4}
                            display="flex"
                            justifyContent="space-around"
                            alignItems="center"
                        >
                            {/* Completed Button - تم التعديل هنا */}
                            <IconButton
                                onClick={() => {
                                    dispatch({
                                        type: "completed",
                                        payload: todo,
                                    });
                                    ShowHiddenOpenToast("Mission Is Edit");
                                }}
                                aria-label={
                                    todo.Incomplete ? "uncompleted" : "completed"
                                }
                                className="Btn"
                                style={{
                                    color: todo.Incomplete
                                        ? "white"
                                        : "#4caf50",
                                    background: todo.Incomplete
                                        ? "#4caf50"
                                        : "white",
                                    border: `solid #4caf50 3px`,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: todo.Incomplete
                                            ? "#388e3c"
                                            : "#e8f5e9",
                                    },
                                }}
                            >
                                <CheckIcon />
                            </IconButton>

                            {/* Edit Button */}
                            <IconButton
                                aria-label="edit"
                                onClick={handelUpdateClick}
                                className="Btn"
                                style={{
                                    color: "#202e3aff",
                                    background: "white",
                                    border: "solid #1769aa 3px",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                <EditIcon />
                            </IconButton>

                            {/* Delete Button */}
                            <IconButton
                                aria-label="delete"
                                className="Btn"
                                style={{
                                    color: "#b23c17",
                                    background: "white",
                                    border: "solid #b23c17 3px",
                                    transition: "all 0.3s ease",
                                }}
                                onClick={handelDeleteClick}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                        {/* Icon Action end  */}
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
}
