import { useEffect } from 'react';
import axios from "axios";
import {useSelector,useDispatch} from "react-redux";
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '..';

const useGetMessages = () => {
    const {selectedUser} = useSelector(store=>store.user);
    const dispatch = useDispatch();
    
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedUser?._id) {
                dispatch(setMessages([]));
                return;
            }

            try {
                axios.defaults.withCredentials = true;
                const res = await axios.get(`${BASE_URL}/api/v1/message/${selectedUser._id}`);
                
                if (res.data) {
                    dispatch(setMessages(res.data));
                } else {
                    console.error("No message data received");
                    dispatch(setMessages([]));
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
                console.error("Error details:", error.response?.data);
                dispatch(setMessages([]));
            }
        }
        fetchMessages();
    }, [selectedUser?._id, dispatch]);
}

export default useGetMessages