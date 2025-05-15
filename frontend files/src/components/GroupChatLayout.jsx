import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import Groups from './Groups';
import GroupChat from './GroupChat';

const GroupChatLayout = () => {
    const { groupId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleBackToChat = () => {
        navigate('/'); // Navigate to main chat
    };

    return (
        <div className="flex h-screen bg-zinc-900">
            {/* Left Sidebar - Group List */}
            <div className={`${isSidebarOpen ? 'w-96' : 'w-0'} transition-all duration-300 ease-in-out border-r border-zinc-700 overflow-hidden flex flex-col`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-4 bg-zinc-800 border-b border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                            
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Groups</h2>
                            <button
                                onClick={handleBackToChat}
                                className="flex items-center gap-2 bg-blue-600 text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-700"
                            >
                                <IoArrowBack className="w-5 h-5" />
                                <span>Back to Chat</span>
                            </button>
                            <button
                                onClick={() => navigate('/create-group')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                New Group
                            </button>
                        </div>
                    </div>
                    {/* Groups List */}
                    <div className="overflow-y-auto flex-1">
                        <Groups />
                    </div>
                </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 relative">
                    {groupId ? (
                        <GroupChat />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-400">
                                <h3 className="text-xl font-semibold mb-2">Welcome to Group Chat</h3>
                                <p>Select a group to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-zinc-800 text-white p-2 rounded-r-lg hover:bg-zinc-700 transition-colors z-10"
            >
                {isSidebarOpen ? '←' : '→'}
            </button>
        </div>
    );
};

export default GroupChatLayout; 