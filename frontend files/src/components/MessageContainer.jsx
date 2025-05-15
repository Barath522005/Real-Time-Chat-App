import React from 'react'
import SendInput from './SendInput'
import Messages from './Messages';
import { useSelector } from "react-redux";

const MessageContainer = () => {
    const { selectedUser } = useSelector(store => store.user);
   
    return (
        <div className='h-full flex flex-col bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
            <div className='px-4 py-2 bg-zinc-800 bg-opacity-50 backdrop-blur-md flex items-center justify-between'>
                {selectedUser ? (
                    <>
                        <div className='flex items-center gap-2'>
                            <img src={selectedUser.profilePhoto} alt="Profile" className='w-8 h-8 md:w-10 md:h-10 rounded-full' />
                            <div>
                                <h2 className='text-white text-sm md:text-base font-semibold'>{selectedUser.fullName}</h2>
                                <p className='text-gray-300 text-xs md:text-sm'>{selectedUser.username}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className='text-white text-center w-full'>
                        <p className='text-sm md:text-base'>Select a user to start chatting</p>
                    </div>
                )}
            </div>
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                <Messages />
            </div>
            <div className='p-4 border-t border-gray-300 bg-zinc-800 bg-opacity-50 backdrop-blur-md'>
                <SendInput />
            </div>
        </div>
    )
}

export default MessageContainer