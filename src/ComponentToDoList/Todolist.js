import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// Modal Delete
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

// Component
import { useToast } from "../Context/ToastContext";
import { useState, useEffect, useMemo } from "react";
import ToDo from "./ToDo";
import { useTodos, useTodosDispatch } from "../Context/ToDosContext";

export default function TodoList() {
    const Todos = useTodos();
    const dispatch = useTodosDispatch();

    const {  ShowHiddenOpenToast } = useToast();

    const [InputTitle, setInputTitle] = useState("");
    const [displayedTodosType, setDisplayedTodosType] = useState("all");
    const [ShowDelete, setShowDelete] = useState();
    const [dialogTodo, setDialogTodo] = useState();
    const [ShowUpdateDialog, setShowUpdateDialog] = useState();

    // filtration Array

    const CompletedTodos = useMemo(() => {
        return Todos.filter((D) => {
            return D.Incomplete;
        });
    }, [Todos]);

    const NotCompletedTodos = useMemo(() => {
        return Todos.filter((D) => {
            return !D.Incomplete;
        });
    }, [Todos]);

    let TodosToBeRender = Todos;
    if (displayedTodosType === "Completed") {
        TodosToBeRender = CompletedTodos;
    } else if (displayedTodosType === "Non-Completed") {
        TodosToBeRender = NotCompletedTodos;
    } else {
        TodosToBeRender = Todos;
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

    // Handlers

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
            {/* Delete To Do */}
            <Dialog
                onClose={handelDeleteDialogClose}
                open={ShowDelete}
                keepMounted
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"You Sure Deleted"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        You Can Not Undo The Deletion
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handelDeleteDialogClose}>Close</Button>
                    <Button onClick={handelDeleteConfirm}>
                        Agree To Deletion
                    </Button>
                </DialogActions>
            </Dialog>
            {/* End Model Delete */}
            {/* Update Dialog */}
            <Dialog
                onClose={handelUpdateClose}
                open={ShowUpdateDialog}
                keepMounted
                aria-describedby="alert-dialog-slide-description"
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
                            setDialogTodo({
                                ...dialogTodo,
                                title: e.target.value,
                            });
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
                            setDialogTodo({
                                ...dialogTodo,
                                details: e.target.value,
                            });
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handelUpdateClose}>Close</Button>
                    <Button onClick={handelUpdateConfirm}>Agree</Button>
                </DialogActions>
            </Dialog>
            {/* END Update Dialog */}
            <Container maxWidth="sm">
                <Card
                    sx={{ minWidth: 275 }}
                    style={{ maxHeight: "80vh", overflow: "scroll" }}
                >
                    <CardContent>
                        <Typography variant="h2">
                            To Do List
                            <Divider />
                        </Typography>

                        {/* ToggleGroup Button Filter */}
                        <ToggleButtonGroup
                            style={{ margin: "10px" }}
                            exclusive
                            value={displayedTodosType}
                            onChange={ChangeDisplayType}
                            aria-label="text alignment"
                            color="primary"
                        >
                            <ToggleButton value="all">All</ToggleButton>
                            <ToggleButton value="Completed">
                                Completed
                            </ToggleButton>
                            <ToggleButton value="Non-Completed">
                                Not Completed
                            </ToggleButton>
                        </ToggleButtonGroup>
                        {/* ToggleGroup Button Filter End */}

                        {/* All ToDo */}
                        {ToDoList}
                        {/* All ToDo End */}

                        {/* Input And Add Button */}
                        <Grid container spacing={2} style={{ margin: "9px" }}>
                            <Grid item xs={8}>
                                <TextField
                                    style={{ width: "100%" }}
                                    id="outlined-basic"
                                    label="Address Mission"
                                    variant="outlined"
                                    value={InputTitle}
                                    onChange={(e) =>
                                        setInputTitle(e.target.value)
                                    }
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    style={{ width: "100%", height: "100%" }}
                                    variant="contained"
                                    onClick={() => {
                                        handelAdd();
                                    }}
                                    disabled={InputTitle.length <= 0}
                                >
                                    Add Mission
                                </Button>
                            </Grid>
                        </Grid>
                        {/* Input And Add Button End */}
                    </CardContent>
                </Card>
            </Container>
        </>
    );
}
