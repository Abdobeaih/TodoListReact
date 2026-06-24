import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { useContext } from "react";
import { useTodosDispatch } from "../Context/ToDosContext";

export default function ToDo({ todo, showDelete, ShowUpdate }) {
    const dispatch = useTodosDispatch();

    return (
        <Card sx={{ my: 1, display: "flex", alignItems: "center", px: 1 }}>
            <CardContent sx={{ flex: 1, py: 1 }}>
                <Typography variant="h6" sx={{ textDecoration: todo.Incomplete ? "none" : "line-through" }}>
                    {todo.title}
                </Typography>
                {todo.details && (
                    <Typography variant="body2" color="text.secondary">
                        {todo.details}
                    </Typography>
                )}
            </CardContent>
            <CardActions>
                <IconButton
                    onClick={() =>
                        dispatch({ type: "completed", payload: todo })
                    }
                    color={todo.Incomplete ? "default" : "success"}
                >
                    {todo.Incomplete ? (
                        <CheckCircleOutlineIcon />
                    ) : (
                        <CheckCircleIcon />
                    )}
                </IconButton>
                <IconButton onClick={() => ShowUpdate(todo)} color="primary">
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => showDelete(todo)} color="error">
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
}
