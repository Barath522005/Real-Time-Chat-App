import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "..";
import { useSelector } from "react-redux";
import { IoSend, IoAttach, IoDownload, IoTrash, IoEllipsisVertical } from "react-icons/io5";
import { FaFile, FaImage } from "react-icons/fa";
import GroupSendInput from "./GroupSendInput";
import toast from "react-hot-toast";

const GroupChat = () => {
    const { groupId } = useParams();
    const [messages, setMessages] = useState([]);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const { authUser } = useSelector((store) => store.user);
    const { socket } = useSelector((store) => store.socket);
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/v1/group/${groupId}`, {
                    withCredentials: true,
                });
                setGroup(res.data);
            } catch (error) {
                console.error("Error fetching group details:", error);
                toast.error("Failed to load group details");
            }
        };

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/v1/group/${groupId}/messages`, {
                    withCredentials: true,
                });
                setMessages(res.data);
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error("Error fetching messages:", error);
                toast.error("Failed to load messages");
                setLoading(false);
            }
        };

        fetchGroupDetails();
        fetchMessages();
    }, [groupId]);

    useEffect(() => {
        if (socket) {
            socket.on("newGroupMessage", (message) => {
                if (message.groupId === groupId) {
                    setMessages(prev => [...prev, message]);
                    setTimeout(scrollToBottom, 100);
                }
            });

            socket.on("userTyping", ({ userId, groupId: typingGroupId }) => {
                if (typingGroupId === groupId && userId !== authUser._id) {
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 3000);
                }
            });

            return () => {
                socket.off("newGroupMessage");
                socket.off("userTyping");
            };
        }
    }, [socket, groupId, authUser._id]);

    const handleMessageSent = (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        setTimeout(scrollToBottom, 100);
        
        // Emit socket event for real-time updates
        socket?.emit("sendGroupMessage", {
            groupId,
            message: newMessage,
        });
    };

    const handleFileDownload = async (fileUrl, fileName) => {
        try {
            const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
            const response = await axios.get(fullUrl, {
                responseType: 'blob',
                withCredentials: true
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.error("Failed to download file");
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessageContent = (message) => {
        if (message.fileUrl) {
            const fullFileUrl = message.fileUrl.startsWith('http') 
                ? message.fileUrl 
                : `${BASE_URL}${message.fileUrl}`;

            if (message.fileType?.startsWith('image/')) {
                return (
                    <div className="relative group">
                        <img
                            src={fullFileUrl}
                            alt="Shared image"
                            className="max-w-[300px] rounded-lg"
                            onError={(e) => {
                                console.error('Image load error:', e);
                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Load+Error';
                            }}
                        />
                        <button
                            onClick={() => handleFileDownload(fullFileUrl, message.fileName)}
                            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <IoDownload className="w-5 h-5 text-white" />
                        </button>
                    </div>
                );
            }
            
            return (
                <div className="flex items-center gap-3 bg-zinc-700/50 p-3 rounded-lg">
                    <FaFile className="w-8 h-8 text-gray-300" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{message.fileName}</p>
                        <p className="text-xs text-gray-400">{message.fileSize}</p>
                    </div>
                    <button
                        onClick={() => handleFileDownload(fullFileUrl, message.fileName)}
                        className="p-2 hover:bg-zinc-600 rounded-full transition-colors"
                    >
                        <IoDownload className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
            );
        }

        return <p className="text-sm break-words">{message.message}</p>;
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            const response = await axios.delete(
                `${BASE_URL}/api/v1/group/${groupId}/message/${messageId}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                // Remove message from local state
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
                toast.success("Message deleted successfully");

                // Emit socket event for real-time updates
                socket?.emit("messageDeleted", {
                    groupId,
                    messageId
                });
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete message";
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on("messageDeleted", ({ messageId }) => {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            });

            return () => {
                socket.off("messageDeleted");
            };
        }
    }, [socket]);

    const renderMessageActions = (message) => {
        // Only show delete button for message sender
        if (message.senderId === authUser._id) {
            return (
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="p-1.5 hover:bg-red-500 rounded-full transition-colors text-gray-400 hover:text-white"
                        title="Delete message"
                    >
                        <IoTrash className="w-4 h-4" />
                    </button>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-900">
                <div className="animate-pulse text-white">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="h-screen max-h-screen flex flex-col bg-zinc-900 relative">
            {/* Login Indicator */}
            <div className="absolute top-0 right-0 bg-black/50 px-4 py-1 m-2 rounded-full z-10 backdrop-blur-sm">
                <span className="text-sm text-emerald-400">Logged in as {authUser.fullName}</span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 bg-zinc-800 p-4 border-b border-zinc-700 flex-shrink-0">
                <div className="avatar">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500">
                        <img 
                            src={group?.groupPhoto || `https://avatar.iran.liara.run/public/boy?username=${group?._id}`} 
                            alt={group?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-white font-semibold text-lg">{group?.name}</h2>
                    <p className="text-gray-400 text-sm">{group?.members?.length || 0} members</p>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
                <div className="min-h-full p-4">
                    {messages.map((message) => (
                        <div
                            key={message._id}
                            className="mb-4 last:mb-0 group relative"
                        >
                            <div className={`flex items-end gap-3 ${
                                message.senderId === authUser._id ? "justify-end" : "justify-start"
                            }`}>
                                {message.senderId !== authUser._id && (
                                    <div className="flex-shrink-0 w-8 h-8">
                                        <img 
                                            src={message.senderPhoto}
                                            alt={message.senderName}
                                            className="w-full h-full rounded-full object-cover ring-1 ring-zinc-600"
                                        />
                                    </div>
                                )}
                                
                                <div className={`flex flex-col ${message.senderId === authUser._id ? "items-end" : "items-start"}`}>
                                    {message.senderId !== authUser._id && (
                                        <span className="text-xs text-gray-400 mb-1 px-1">
                                            {message.senderName}
                                        </span>
                                    )}
                                    <div className={`relative max-w-[300px] px-4 py-2 rounded-2xl group ${
                                        message.senderId === authUser._id
                                            ? "bg-blue-600 text-white rounded-tr-sm"
                                            : "bg-zinc-700 text-white rounded-tl-sm"
                                    }`}>
                                        {renderMessageContent(message)}
                                        {renderMessageActions(message)}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {formatTime(message.createdAt)}
                                    </span>
                                </div>

                                {message.senderId === authUser._id && (
                                    <div className="flex-shrink-0 w-8 h-8">
                                        <img 
                                            src={authUser.profilePhoto}
                                            alt={authUser.fullName}
                                            className="w-full h-full rounded-full object-cover ring-1 ring-zinc-600"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="text-gray-400 text-sm animate-pulse mt-2">
                            Someone is typing...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <GroupSendInput groupId={groupId} onMessageSent={handleMessageSent} />
        </div>
    );
};

// Add this CSS to your global styles or component
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
`;
document.head.appendChild(style);

export default GroupChat;