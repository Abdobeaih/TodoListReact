import { createContext, useState, useContext } from "react";
import MySnackBar from "../ComponentToDoList/MySnackBar";

export const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    function ShowHiddenOpenToast(message) {
        setOpen(true);
        setMessage(message);
        setTimeout(() => {
            setOpen(false);
        }, 2000);
    }
    return (
        <ToastContext.Provider value={{ ShowHiddenOpenToast }}>
            <MySnackBar open={open} message={message} />
            {children}
        </ToastContext.Provider>
    );
};
export const useToast = () => {
    return useContext( ToastContext );
};
