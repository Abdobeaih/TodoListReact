import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { useToast } from "../Context/ToastContext";
import { useState, useEffect, useMemo } from "react";
import ToDo from "./ToDo";
import { useTodos, useTodosDispatch } from "../Context/ToDosContext";

export default function TodoList() {
    const Todos = useTodos();
    const dispatch = useTodosDispatch();
    const { ShowHiddenOpenToast } = useToast();

    const [InputTitle, setInputTitle] = useState("");
    const [displayedTodosType, setDisplayedTodosType] = useState("all");
    const [ShowDelete, setShowDelete] = useState();
    const [dialogTodo, setDialogTodo] = useState();
    const [ShowUpdateDialog, setShowUpdateDialog] = useState();

    const CompletedTodos = useMemo(() => {
        return Todos.filter((D) => D.Incomplete);
    }, [Todos]);

    const NotCompletedTodos = useMemo(() => {
        return Todos.filter((D) => !D.Incomplete);
    }, [Todos]);

    let TodosToBeRender = Todos;
    if (displayedTodosType === "Completed") {
        TodosToBeRender = CompletedTodos;
    } else if (displayedTodosType === "Non-Completed") {
        TodosToBeRender = NotCompletedTodos;
    }

    const ToDoList = TodosToBeRender.map((D) => {
        return (
            <ToDo
                key={D.id}
                todo={D}
                showDelete={ShowDeleteDialog}
                ShowUpdate={showUpdateDialog}
            />
        );
    });

    useEffect(() => {
        dispatch({ type: "get" });
    }, [dispatch]);

    function ChangeDisplayType(e) {
        setDisplayedTodosType(e.target.value);
    }

    function handelAdd() {
        dispatch({ type: "added", payload: { newTitle: InputTitle } });
        setInputTitle("");
        ShowHiddenOpenToast("Add Mission success");
    }

    function ShowDeleteDialog(todo) {
        setDialogTodo(todo);
        setShowDelete(true);
    }

    function showUpdateDialog(todo) {
        setDialogTodo(todo);
        setShowUpdateDialog(true);
    }

    function handelDeleteDialogClose() {
        setShowDelete(false);
    }

    function handelDeleteConfirm() {
        dispatch({ type: "deleted", payload: dialogTodo });
        setShowDelete(false);
        ShowHiddenOpenToast("Done Deleted Mission");
    }

    function handelUpdateClose() {
        setShowUpdateDialog(false);
    }

    function handelUpdateConfirm() {
        dispatch({ type: "Update", payload: dialogTodo });
        setShowUpdateDialog(false);
        ShowHiddenOpenToast("Done Updated Mission");
    }

    return (
        <>
            <Dialog
                onClose={handelDeleteDialogClose}
                open={ShowDelete}
            >
                <DialogTitle>{"Are You Sure?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You Can Not Undo The Deletion
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handelDeleteDialogClose}>Close</Button>
                    <Button onClick={handelDeleteConfirm}>Agree To Deletion</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                onClose={handelUpdateClose}
                open={ShowUpdateDialog}
            >
                <DialogTitle>{"Update Mission"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="title"
                        label="Title Mission"
                        fullWidth
                        variant="standard"
                        value={dialogTodo?.title}
                        onChange={(e) => {
                            setDialogTodo({ ...dialogTodo, title: e.target.value });
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="details"
                        label="Details"
                        fullWidth
                        variant="standard"
                        value={dialogTodo?.details}
                        onChange={(e) => {
                            setDialogTodo({ ...dialogTodo, details: e.target.value });
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handelUpdateClose}>Close</Button>
                    <Button onClick={handelUpdateConfirm}>Agree</Button>
                </DialogActions>
            </Dialog>

            <Container maxWidth="sm">
                <Card sx={{ minWidth: 275 }}>
                    <CardContent>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                            Todo List
                        </Typography>
                        <Divider sx={{ my: 1 }} />

                        <ToggleButtonGroup
                            sx={{ my: 2 }}
                            exclusive
                            fullWidth
                            value={displayedTodosType}
                            onChange={ChangeDisplayType}
                            color="primary"
                        >
                            <ToggleButton value="all">All</ToggleButton>
                            <ToggleButton value="Completed">Completed</ToggleButton>
                            <ToggleButton value="Non-Completed">Not Completed</ToggleButton>
                        </ToggleButtonGroup>

                        {ToDoList}

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid size={8}>
                                <TextField
                                    fullWidth
                                    label="New Mission"
                                    variant="outlined"
                                    value={InputTitle}
                                    onChange={(e) => setInputTitle(e.target.value)}
                                />
                            </Grid>
                            <Grid size={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ height: "100%" }}
                                    onClick={handelAdd}
                                    disabled={InputTitle.length <= 0}
                                >
                                    Add
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
}
