import React, { useEffect } from 'react'
import Sidebar from './Sidebar'
import MessageContainer from './MessageContainer'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const { authUser } = useSelector(store => store.user);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, []);

  return (
    <div className='w-full h-screen flex flex-col md:flex-row bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
      <div className='w-full md:w-80 flex-shrink-0'>
        <Sidebar />
      </div>
      <div className='flex-1 overflow-hidden'>
        <MessageContainer />
      </div>
    </div>
  )
}

export default HomePage