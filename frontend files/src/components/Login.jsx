import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from '../redux/userSlice';
import { BASE_URL } from '..';

const Login = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/login`, user, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (res && res.data) {
        navigate("/");
        dispatch(setAuthUser(res.data));
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data?.message || "Login failed");
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please check if the server is running.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Error setting up the request");
      }
      console.log(error);
    }
    setUser({
      username: "",
      password: ""
    })
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
        <h1 className='text-2xl md:text-3xl font-bold text-center mb-6'>Login</h1>
        <form onSubmit={onSubmitHandler} action="" className="space-y-4">
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Username</span>
            </label>
            <input
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className='w-full input input-bordered h-10 text-sm md:text-base'
              type="text"
              placeholder='Username' />
          </div>
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Password</span>
            </label>
            <input
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className='w-full input input-bordered h-10 text-sm md:text-base'
              type="password"
              placeholder='Password' />
          </div>
          <p className='text-center my-2 text-sm md:text-base'>Don't have an account? <Link to="/signup" className="text-blue-500 hover:text-blue-700"> signup </Link></p>
          <div>
            <button type="submit" className='btn btn-block btn-sm md:btn-md mt-2 border border-slate-700 text-sm md:text-base'>Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login