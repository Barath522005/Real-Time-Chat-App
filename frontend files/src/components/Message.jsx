import React, { useEffect, useRef, useState } from 'react'
import {useSelector, useDispatch} from "react-redux";
import axios from "axios";
import { deleteMessage } from '../redux/messageSlice';
import { BASE_URL } from '..';
import { IoTrash, IoImage, IoDocument, IoDownload } from "react-icons/io5";

const Message = ({message}) => {
    const scroll = useRef();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageError, setImageError] = useState(false);
    const {authUser, selectedUser} = useSelector(store=>store.user);
    const dispatch = useDispatch();

    useEffect(()=>{
        scroll.current?.scrollIntoView({behavior:"smooth"});
    },[message]);
    
    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const dateStr = message?.createdAt || timestamp;
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDelete = async () => {
        if (!message?._id) return;
        
        setIsDeleting(true);
        try {
            const res = await axios.delete(`${BASE_URL}/api/v1/message/${message._id}`, {
                withCredentials: true
            });
            
            if (res.status === 200) {
                dispatch(deleteMessage(message._id));
                setShowDeleteConfirm(false);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            alert(error.response?.data?.message || "Failed to delete message");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFileDownload = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`${BASE_URL}${message.fileUrl}`, {
                responseType: 'blob',
                withCredentials: true
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', message.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Failed to download file");
        }
    };

    const renderMessageContent = () => {
        switch (message.messageType) {
            case 'image':
                return (
                    <div className="relative group">
                        <img 
                            src={`${BASE_URL}${message.fileUrl}`} 
                            alt={message.fileName}
                            className={`max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${imageError ? 'hidden' : ''}`}
                            onClick={() => window.open(`${BASE_URL}${message.fileUrl}`, '_blank')}
                            onError={() => setImageError(true)}
                        />
                        {imageError && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <IoImage size={24} />
                                <span>Image not available</span>
                            </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">{message.fileName}</div>
                    </div>
                );
            case 'audio':
                return (
                    <div className="flex items-center gap-2">
                        <audio controls className="max-w-xs">
                            <source src={`${BASE_URL}${message.fileUrl}`} type={message.fileType} />
                            Your browser does not support the audio element.
                        </audio>
                        <div className="text-xs text-gray-400">{formatFileSize(message.fileSize)}</div>
                    </div>
                );
            case 'file':
                return (
                    <div className="flex items-center gap-2 group">
                        <a 
                            href={`${BASE_URL}${message.fileUrl}`}
                            onClick={handleFileDownload}
                            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                        >
                            <IoDocument size={24} />
                            <span>{message.fileName}</span>
                            <IoDownload className="opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                        </a>
                        <div className="text-xs text-gray-400">{formatFileSize(message.fileSize)}</div>
                    </div>
                );
            default:
                return <div className="chat-bubble">{message.message}</div>;
        }
    };
    
    return (
        <div ref={scroll} className={`chat ${message?.senderId === authUser?._id ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    <img alt="Tailwind CSS chat bubble component" src={message?.senderId === authUser?._id ? authUser?.profilePhoto : selectedUser?.profilePhoto} />
                </div>
            </div>
            <div className="chat-header flex items-center gap-2">
                <time className="text-xs opacity-50 text-white">{formatTime(message?.createdAt)}</time>
                {message?.senderId === authUser?._id && (
                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete message"
                    >
                        <IoTrash size={16} />
                    </button>
                )}
            </div>
            <div className={`chat-bubble ${message?.senderId !== authUser?._id ? 'bg-gray-200 text-black' : ''}`}>
                {renderMessageContent()}
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                        <h3 className="text-white text-lg mb-4">Delete Message</h3>
                        <p className="text-gray-300 mb-4">Are you sure you want to delete this message?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Message