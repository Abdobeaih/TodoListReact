/* eslint-disable eqeqeq */
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
// Modal Delelte
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';





import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// Component
import { useToast } from '../Context/ToastContex';
import { useState,useEffect, useMemo } from 'react';
import ToDo from './ToDo';
// import todosReducer from '../Reducer/ReducerTodos';
import { useTodos , useTodosDispatch} from '../Context/ToDosContext';



export default function TodoList() {
  const Todos =useTodos()
  const dispatch =useTodosDispatch()
 
  const {ShowHiddeOpenToast}=useToast()

  const [InputTitle, setInputTitle] = useState("")
  const [displayedTodosType,setdisplayedTodosType]=useState("all")
   const [ShowDelete,setShowDelete]=useState()
   const[dialogTodo,setdialogeTodo]=useState()
   const [ShowUpdateDialoge,setShowUpdateDialoge]=useState()



  // filtertion Array
  
 const CompletedTodos= useMemo(()=>{

  return Todos.filter((D)=>{
  return D.Iscompleted
  })
  },[Todos])

 const NotCompletedTodos=useMemo(()=>{
  return Todos.filter((D)=>{  
  return !D.Iscompleted
  })

 },[Todos])
 

  let TodosToBeReander = Todos
  if(displayedTodosType === "Completed") {
  TodosToBeReander = CompletedTodos
} else if(displayedTodosType === "Non-Completed") {
  TodosToBeReander = NotCompletedTodos
} else {
  TodosToBeReander = Todos
}


 const ToDoList = TodosToBeReander.map((D) => {
  return <ToDo key={D.id} todo={D} showDelete={ShowDeleteDialoge} ShowUpdate={showUpdateDialoge} />

})

  
useEffect (() => {
  dispatch({type:"get"})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

// Handelers


function ChangeDisplayType(e){
setdisplayedTodosType(e.target.value)
}
  function handelAdd () {
 dispatch({type:"added", payload:{newTitle:InputTitle}})

    setInputTitle("")
    ShowHiddeOpenToast("Add Mission success")
  }
 
  function ShowDeleteDialoge(todo){
   setdialogeTodo(todo)
    setShowDelete(true)
    

  }
  function showUpdateDialoge(todo) {
  setdialogeTodo(todo)
  setShowUpdateDialoge(true)
}
  function handelDeleteDailogClose(){
      setShowDelete(false)
    }
    
    function handelDeletConfirm(){
      dispatch({type:"deleted",payload: dialogTodo})
      setShowDelete(false)
      ShowHiddeOpenToast("Done Deleted Mission")

    }
    function handelUpdateClose() {
  setShowUpdateDialoge(false);
}

    function handelUpdateConfirm() {
      dispatch({type:"Update",payload: dialogTodo})
    setShowUpdateDialoge(false);
      ShowHiddeOpenToast("Done Updated Mission")
  }
  return (
    <>
              {/* Delete To Do */}
          <Dialog
          onClose={handelDeleteDailogClose}
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
          <Button onClick={handelDeleteDailogClose} >Close</Button>
          <Button onClick={handelDeletConfirm} >Agree To Deletion</Button>
        </DialogActions>
      </Dialog>
      {/* End Model Delete */}
      {/* Updeta Dialog */}
      <Dialog
        onClose={handelUpdateClose}
        open={ShowUpdateDialoge}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Update Mission"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="titel"
            label="Titel Mission"
            fullWidth
            variant="standard"
            value={dialogTodo?.titel}
            onChange={(e) => {
              setdialogeTodo({
                ...dialogTodo,
                titel: e.target.value
              })
            }}
          />
          <TextField
            margin="dense"
            id="details"
            label="Ditails"
            fullWidth
            variant="standard" 
            value={dialogTodo?.details}
            onChange={(e) => {
              setdialogeTodo({
                ...dialogTodo,
                details: e.target.value
              })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handelUpdateClose}>Close</Button>
          <Button onClick={handelUpdateConfirm}>Agree</Button>
        </DialogActions>
      </Dialog>
      {/* END Updeta Dialog */}
    <Container maxWidth="sm" >
      <Card sx={{ minWidth: 275 }} style={{maxHieght:"80vh",overflow:"scroll"}}>
        <CardContent>
          <Typography variant='h2'>
            To Do List
            <Divider />
          </Typography>

          {/* ToggelGroub Button Filter */}
          <ToggleButtonGroup
            style= {{ margin: "10px" }}
            exclusive
            value={displayedTodosType}
            onChange={ChangeDisplayType}
            aria-label="text alignment"
            color="primary"
          >
            <ToggleButton value="All">All</ToggleButton>
            <ToggleButton value="Completed">Completed</ToggleButton>
            <ToggleButton value="Non-Completed">Not Completed</ToggleButton>
          </ToggleButtonGroup>
          {/* ToggelGroub Button Filter End */}

          {/* All ToDo */}
          {ToDoList}
          {/* All ToDo End */}

          {/* Input And Add Button */}
          <Grid container spacing={2} style={{ margin: "9px" }}>
            <Grid  size xs={8}>
              <TextField
                style={{ width: "100%" }}
                id="outlined-basic"
                label="Addres Mission"
                variant="outlined"
                value={InputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
              />
            </Grid>
            <Grid size  xs={4}>
              <Button
                style={{ width: "100%", height: "100%" }}
                variant="contained"
                onClick={()=>{handelAdd()}}
                disabled={InputTitle.length<=0}
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
  )
} 