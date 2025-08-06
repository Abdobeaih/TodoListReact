import { createContext,useState,useContext } from "react";
import MySnackBar from "../ComponentToDoList/MySnackBar";
 
 export const ToastContext=createContext({})

 export const ToastProvider=({Children})=>{
      const [open, setOpen] = useState(false);
      const [message, setMessage] = useState("");
    function  ShowHiddeOpenToast(message){
    setOpen(true)
    setMessage(message)
    setTimeout(()=>{
      setOpen(false)
    },200)
  }
    return(
        <ToastContext.Provider value={{ShowHiddeOpenToast }}>
                 <MySnackBar open={open} message={message}/>
            
            {Children}</ToastContext.Provider>
    )
  }
 export const useToast= ()=>{return useContext({ToastContext})}