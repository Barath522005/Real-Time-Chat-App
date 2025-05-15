
import React, { useState, useRef } from 'react';
import { IoSend, IoAttach, IoClose } from "react-icons/io5";
import { FaFile, FaImage } from "react-icons/fa";
import axios from "axios";
import { BASE_URL } from '..';
import toast from 'react-hot-toast';

const GroupSendInput = ({ groupId, onMessageSent }) => {
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (10MB limit)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error("File size exceeds 10MB limit");
                event.target.value = '';
                return;
            }

            // Validate file type
            const allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain'
            ];

            if (!allowedTypes.includes(file.type)) {
                toast.error("Invalid file type. Only images and documents are allowed.");
                event.target.value = '';
                return;
            }

            setSelectedFile(file);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() && !selectedFile) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            if (message.trim()) {
                formData.append('message', message.trim());
            }
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const res = await axios.post(
                `${BASE_URL}/api/v1/group/${groupId}/send-message`,
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

            if (res.data.success) {
                setMessage("");
                clearSelectedFile();
                if (onMessageSent) {
                    onMessageSent(res.data.newMessage);
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const getFilePreviewContent = () => {
        if (!selectedFile) return null;

        if (selectedFile.type.startsWith('image/')) {
            return (
                <div className="relative w-16 h-16 rounded overflow-hidden">
                    <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected file"
                        className="w-full h-full object-cover"
                    />
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2 text-gray-300">
                <FaFile className="w-5 h-5" />
                <span className="text-sm truncate max-w-[150px]">{selectedFile.name}</span>
            </div>
        );
    };

    return (
        <div className="p-4 bg-zinc-800 border-t border-zinc-700">
            {/* File Preview */}
            {selectedFile && (
                <div className="mb-2 p-2 bg-zinc-700 rounded-lg flex items-center justify-between">
                    {getFilePreviewContent()}
                    <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="p-1 hover:bg-zinc-600 rounded-full transition-colors"
                    >
                        <IoClose className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
                <div className="mb-2">
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-zinc-700 flex-shrink-0"
                    disabled={isUploading}
                >
                    <IoAttach className="w-6 h-6" />
                </button>

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    disabled={isUploading}
                />

                <button
                    type="submit"
                    className="p-2 text-blue-500 hover:text-white hover:bg-blue-500 transition-all duration-200 rounded-full disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-blue-500 flex-shrink-0"
                    disabled={isUploading || (!message.trim() && !selectedFile)}
                >
                    <IoSend className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
};

export default GroupSendInput; 
