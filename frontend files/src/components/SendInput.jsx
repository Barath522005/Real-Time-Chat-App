import React, {useState, useRef, useEffect } from 'react'
import { IoSend, IoAttach } from "react-icons/io5";
import axios from "axios";
import {useDispatch,useSelector} from "react-redux";
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '..';

const SendInput = () => {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const formRef = useRef(null);
    const dispatch = useDispatch();
    const {selectedUser, authUser} = useSelector(store=>store.user);
    const {messages} = useSelector(store=>store.message);
    const {socket, isConnected} = useSelector(store=>store.socket);

    // Debug logging for user and socket state
    useEffect(() => {
        console.log('Current auth user:', authUser);
        console.log('Selected user:', selectedUser);
        console.log('Socket connected:', isConnected);
    }, [authUser, selectedUser, isConnected]);

    // Handle ResizeObserver
    useEffect(() => {
        let resizeObserver;
        if (formRef.current) {
            resizeObserver = new ResizeObserver((entries) => {
                // Use requestAnimationFrame to avoid layout changes during the resize callback
                requestAnimationFrame(() => {
                    // Handle resize here if needed
                    console.log('ResizeObserver triggered');
                });
            });
            resizeObserver.observe(formRef.current);
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, []);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size before upload
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setError("File size exceeds 10MB limit");
                event.target.value = ''; // Clear the input
                return;
            }

            // Validate file type
            const allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif',
                'audio/mpeg', 'audio/wav', 'audio/ogg',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                setError("Invalid file type. Only images, audio, and common document types are allowed.");
                event.target.value = ''; // Clear the input
                return;
            }

            handleFileUpload(file);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        
        setIsUploading(true);
        setError("");
        setUploadProgress(0);

        try {
            if (!isConnected || !socket) {
                setError("Socket connection not established. Please refresh the page.");
                return;
            }

            if (!selectedUser?._id) {
                setError("No user selected. Please select a user to send a message.");
                return;
            }

            if (!authUser?._id) {
                setError("You must be logged in to send messages.");
                return;
            }

            if (!authUser?.fullName) {
                setError("Your profile is incomplete. Please update your profile with your full name.");
                return;
            }

            // Create FormData and append file with proper field name
            const formData = new FormData();
            formData.append('file', file);
            formData.append('message', message.trim() || '');
            formData.append('senderName', authUser.fullName);

            // Log the file details for debugging
            console.log("File details:", {
                name: file.name,
                type: file.type,
                size: file.size
            });
            
            console.log("Sending file to user:", selectedUser._id);
            console.log("Auth user ID:", authUser._id);
            console.log("Form data fields:", [...formData.entries()].map(([key, value]) => {
                return { key, value: value instanceof File ? value.name : value };
            }));
            
            const res = await axios.post(
                `${BASE_URL}/api/v1/message/send/${selectedUser._id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true,
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                }
            );

            console.log("File upload response:", res.data);

            if (res?.data?.newMessage) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setMessage("");
                setError("");
                // Clear the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                setError("Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            console.error("Error details:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Full error object:", JSON.stringify(error, null, 2));
            
            // Handle specific error cases
            if (error.response?.status === 400) {
                setError(error.response.data.message || "Invalid request. Please check your input.");
            } else if (error.response?.status === 413) {
                setError("File size too large. Maximum size is 10MB.");
            } else if (error.response?.status === 415) {
                setError("Unsupported file type. Please upload a valid file.");
            } else {
                setError(error.response?.data?.message || "Failed to send message. Please try again.");
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        try {
            if (!isConnected || !socket) {
                setError("Socket connection not established. Please refresh the page.");
                return;
            }

            if (!selectedUser?._id) {
                setError("No user selected. Please select a user to send a message.");
                return;
            }

            if (!authUser?._id) {
                setError("You must be logged in to send messages.");
                return;
            }

            if (!authUser?.fullName) {
                setError("Your profile is incomplete. Please update your profile with your full name.");
                return;
            }

            const messageData = {
                message: message.trim(),
                senderName: authUser.fullName
            };

            console.log("Sending message to user:", selectedUser._id);
            console.log("Auth user ID:", authUser._id);
            console.log("Message payload:", messageData);

            const res = await axios.post(
                `${BASE_URL}/api/v1/message/send/${selectedUser._id}`,
                messageData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            console.log("Message send response:", res.data);

            if (res?.data?.newMessage) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setMessage("");
                setError("");
            } else {
                setError("Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            console.error("Error details:", error.response?.data);
            console.error("Error status:", error.response?.status);
            console.error("Full error object:", JSON.stringify(error, null, 2));
            setError(error.response?.data?.message || "Failed to send message. Please try again.");
        }
    };

    return (
        <form ref={formRef} onSubmit={onSubmitHandler} className='px-4 my-3'>
            <div className='w-full relative'>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    type="text"
                    placeholder='Send a message...'
                    className='border text-sm rounded-lg block w-full p-3 border-zinc-500 bg-gray-600 text-white'
                    disabled={isUploading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        disabled={isUploading}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Attach file"
                        disabled={isUploading}
                    >
                        <IoAttach size={20} />
                    </button>
                    <button
                        type="submit"
                        className="text-green-200 hover:text-green-500 transition-colors"
                        disabled={isUploading || !message.trim()}
                    >
                        <IoSend size={20} />
                    </button>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {isUploading && (
                <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Uploading: {uploadProgress}%</p>
                </div>
            )}
        </form>
    );
};

export default SendInput;