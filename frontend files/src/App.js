import './App.css';
import { RouterProvider} from "react-router-dom";
import { useEffect, useRef } from 'react';
import {useSelector,useDispatch} from "react-redux";
import io from "socket.io-client";
import { setSocket, setConnectionStatus } from './redux/socketSlice';
import { setOnlineUsers } from './redux/userSlice';
import { BASE_URL } from '.';

import router from './route/router';


function App() { 
  const {authUser} = useSelector(store=>store.user);
  const {socket, isConnected} = useSelector(store=>store.socket);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (authUser && !socketRef.current) {
      socketRef.current = io(`${BASE_URL}`, {
        query: {
          userId: authUser._id
        }
      });

      socketRef.current.on('connect', () => {
        dispatch(setConnectionStatus(true));
        dispatch(setSocket(socketRef.current));
      });

      socketRef.current.on('disconnect', () => {
        dispatch(setConnectionStatus(false));
      });

      socketRef.current.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        dispatch(setSocket(null));
        dispatch(setConnectionStatus(false));
      }
    };
  }, [authUser, dispatch]); 

  return (
    <div className="p-4 h-screen flex flex-col items-center justify-center">
     
      <RouterProvider router={router}/>
    </div>
  );
}

export default App;