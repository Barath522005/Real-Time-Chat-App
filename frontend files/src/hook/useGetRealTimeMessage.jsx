import { useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import { setMessages, deleteMessage } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
    const {socket} = useSelector(store=>store.socket);
    const {messages} = useSelector(store=>store.message);
    const dispatch = useDispatch();

    useEffect(()=>{
        socket?.on("newMessage", (newMessage)=>{
            dispatch(setMessages([...messages, newMessage]));
        });

        socket?.on("messageDeleted", (messageId)=>{
            dispatch(deleteMessage(messageId));
        });

        return () => {
            socket?.off("newMessage");
            socket?.off("messageDeleted");
        };
    },[socket, messages, dispatch]);
};

export default useGetRealTimeMessage;