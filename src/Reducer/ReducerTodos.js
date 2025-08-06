import {v4 as uuidv4} from 'uuid'

export default function reducer(CurrentTodos,action){
  

    switch(action.type){
        case "added":{
            const newTodo ={
                id:uuidv4(),
                title: action.payload.newTitle,
                details:"",
                Iscompleted:false
            }
            const UpdatedTodos=[...CurrentTodos, newTodo]
                localStorage.setItem("todos", JSON.stringify(UpdatedTodos))
                
                return (UpdatedTodos)


        }
        case "deleted":{
             const  UpdetTodos=CurrentTodos.filter((D)=>{
        
        return D.id !== action.payload.id
      })
      
       localStorage.setItem("todos", JSON.stringify(UpdetTodos))
       return UpdetTodos
        }
        case "Update": {
  const updatedTodos = CurrentTodos.map((D) => {
    if (D.id === action.payload.id) {
      return {
        ...D,
        title: action.payload.titel,
        details: action.payload.details
      };
    } else {
      return D;
    }
  });
  localStorage.setItem("todos", JSON.stringify(updatedTodos));
  return updatedTodos;
}

        case"get":{
            const StotageTodos = JSON.parse(localStorage.getItem("todos"))??[];
            return StotageTodos
        }
       case "Completed":{
                const updatedTodos=CurrentTodos.map(D=>{
                   
            // eslint-disable-next-line eqeqeq
            if(D.id == action.payload.id){
                 const updatedTodos={
                        ...D, Iscompleted:!D.Iscompleted
                    }
                    return updatedTodos
                
            }
            return D
        })
        
        localStorage.setItem("todos", JSON.stringify(updatedTodos))
        
        return updatedTodos
    }


        default:{ 
            throw Error("action is Unkwon" + action.type)
        }
    }
    
    // eslint-disable-next-line no-unreachable
    return  [];
 }
