import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "..";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateGroup = () => {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [groupPhoto, setGroupPhoto] = useState("");
    const { otherUsers, authUser } = useSelector((store) => store.user);
    const navigate = useNavigate();

    useEffect(() => {
        // Generate a random avatar URL
        const randomId = Math.floor(Math.random() * 1000);
        setGroupPhoto(`https://avatar.iran.liara.run/public/boy?username=${randomId}`);
    }, []);

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            toast.error("Please enter a group name");
            return;
        }

        if (selectedMembers.length === 0) {
            toast.error("Please select at least one member");
            return;
        }

        try {
            const res = await axios.post(
                `${BASE_URL}/api/v1/group/create`,
                {
                    name: groupName,
                    members: [...selectedMembers, authUser._id],
                    groupPhoto: groupPhoto
                },
                { withCredentials: true }
            );
            
            toast.success("Group created successfully!");
            navigate("/groups");
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error(error.response?.data?.message || "Failed to create group");
        }
    };

    return (
        <div className="min-w-96 mx-auto">
            <div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100'>
                <h1 className='text-3xl font-bold text-center text-white mb-6'>Create New Group</h1>
                
                <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                        <img 
                            src={groupPhoto} 
                            alt="Group Avatar" 
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                        />
                        <button
                            onClick={() => {
                                const randomId = Math.floor(Math.random() * 1000);
                                setGroupPhoto(`https://avatar.iran.liara.run/public/boy?username=${randomId}`);
                            }}
                            className="absolute bottom-0 right-0 bg-zinc-700 text-white p-2 rounded-full hover:bg-zinc-600 transition-colors"
                            title="Change avatar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className='label p-2'>
                        <span className='text-base label-text text-white'>Group Name</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className='w-full input input-bordered h-10 bg-zinc-700 text-white border-zinc-600'
                    />
                </div>

                <div className="mb-4">
                    <label className='label p-2'>
                        <span className='text-base label-text text-white'>Select Members</span>
                    </label>
                    <div className="max-h-60 overflow-y-auto bg-zinc-700 rounded-lg p-2">
                        {otherUsers?.map((user) => (
                            <div key={user._id} className="flex items-center gap-2 p-2 hover:bg-zinc-600 rounded-lg">
                                <input
                                    type="checkbox"
                                    value={user._id}
                                    checked={selectedMembers.includes(user._id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedMembers([...selectedMembers, user._id]);
                                        } else {
                                            setSelectedMembers(selectedMembers.filter((id) => id !== user._id));
                                        }
                                    }}
                                    className="checkbox checkbox-primary"
                                />
                                <div className="flex items-center gap-2">
                                    <img 
                                        src={user.profilePhoto} 
                                        alt={user.fullName} 
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="text-white">{user.fullName}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={handleCreateGroup}
                        className='btn btn-primary flex-1 bg-zinc-700 text-white hover:bg-zinc-600'
                    >
                        Create Group
                    </button>
                    <button 
                        onClick={() => navigate("/groups")}
                        className='btn btn-outline flex-1 text-white border-zinc-600 hover:bg-zinc-700'
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup;