import React, { useState, useEffect, useRef } from 'react'
import { BiSearchAlt2 } from "react-icons/bi";
import { IoPeople, IoAddCircle } from "react-icons/io5";
import OtherUsers from './OtherUsers';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import axios from "axios";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from "react-redux";
import { setAuthUser, setOtherUsers, setSelectedUser } from '../redux/userSlice';
import { setSocket, setConnectionStatus } from '../redux/socketSlice';
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '..';
 
const Sidebar = () => {
    const [search, setSearch] = useState("");
    const {otherUsers, authUser} = useSelector(store=>store.user);
    const {socket} = useSelector(store=>store.socket);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const socketRef = useRef(null);

    useEffect(() => {
        if (socket) {
            socketRef.current = socket;
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
                dispatch(setSocket(null));
                dispatch(setConnectionStatus(false));
            }
        };
    }, [socket, dispatch]);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/user/logout`);
            navigate("/login");
            toast.success(res.data.message);
            dispatch(setAuthUser(null));
            dispatch(setMessages(null));
            dispatch(setOtherUsers(null));
            dispatch(setSelectedUser(null));
        } catch (error) {
            console.log(error);
        }
    }

    const searchSubmitHandler = (e) => {
        e.preventDefault();
        const conversationUser = otherUsers?.find((user)=> user.fullName.toLowerCase().includes(search.toLowerCase()));
        if(conversationUser){
            dispatch(setOtherUsers([conversationUser]));
        }else{
            toast.error("User not found!");
        }
    }

    return (
        <div className='h-full border-r border-slate-500 p-4 flex flex-col bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
            <div className="mb-4 bg-zinc-800 bg-opacity-50 backdrop-blur-md px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
                {authUser ? (
                    <>
                        <ProfilePhotoUpload currentPhoto={authUser.profilePhoto} />
                        <p className="text-white text-sm md:text-base truncate">Logged in as {authUser.username}</p>
                    </>
                ) : (
                    <p className="text-red-500">Not logged in</p>
                )}
            </div>
            <form onSubmit={searchSubmitHandler} action="" className='flex items-center gap-2 mb-4'>
                <input
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    className='input input-bordered rounded-md flex-1 text-sm md:text-base bg-zinc-800 bg-opacity-50 backdrop-blur-md text-white placeholder-gray-400' 
                    type="text"
                    placeholder='Search...'
                />
                <button type='submit' className='btn bg-zinc-700 hover:bg-zinc-600 text-white p-2'>
                    <BiSearchAlt2 className='w-5 h-5 md:w-6 md:h-6 outline-none'/>
                </button>
            </form>
            <div className="divider px-3 before:bg-gray-300 after:bg-gray-300"></div> 
            <div className="flex gap-2 mb-4">
                <button 
                    onClick={() => navigate("/create-group")}
                    className="btn btn-sm bg-zinc-700 hover:bg-zinc-600 text-white flex items-center gap-2 text-xs md:text-sm"
                    title="Create Group"
                >
                    <IoAddCircle className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Create Group</span>
                </button>
                <button 
                    onClick={() => navigate("/groups")}
                    className="btn btn-sm bg-zinc-700 hover:bg-zinc-600 text-white flex items-center gap-2 text-xs md:text-sm"
                    title="View Groups"
                >
                    <IoPeople className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Groups</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <OtherUsers/> 
            </div>
            <div className='mt-4'>
                <button onClick={logoutHandler} className='btn btn-sm w-full bg-zinc-700 hover:bg-zinc-600 text-white'>Logout</button>
            </div>
        </div>
    )
}

export default Sidebar