import React, { useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../redux/userSlice';
import { BASE_URL } from '..';

// Default avatar data URL (a simple gray circle)
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCI+CiAgPGNpcmNsZSBjeD0iNzUiIGN5PSI3NSIgcj0iNzUiIGZpbGw9IiNlZWUiLz4KICA8Y2lyY2xlIGN4PSI3NSIgY3k9IjUwIiByPSIzMCIgZmlsbD0iIzk5OSIvPgogIDxwYXRoIGQ9Ik03NSAxMDBjLTI1IDAtNDUgMjAtNDUgNDVoOTBjMC0yNS0yMC00NS00NS00NXoiIGZpbGw9IiM5OTkiLz4KPC9zdmc+';

const ProfilePhotoUpload = ({ currentPhoto }) => {
    const [isUploading, setIsUploading] = useState(false);
    const dispatch = useDispatch();

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${BASE_URL}/api/v1/user/profile-photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update the user state with the new profile photo
            dispatch(setAuthUser(response.data.user));
            toast.success('Profile photo updated successfully');
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error(error.response?.data?.message || 'Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative group">
            <img
                src={currentPhoto || DEFAULT_AVATAR}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = DEFAULT_AVATAR;
                }}
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer">
                <FiUpload className="text-white text-xl" />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading}
                />
            </label>
        </div>
    );
};

export default ProfilePhotoUpload; 