import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '..';
import { IoPeople } from "react-icons/io5";
import toast from "react-hot-toast";

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { groupId } = useParams();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/v1/group`, {
                    withCredentials: true
                });
                setGroups(res.data);
            } catch (error) {
                console.error("Error fetching groups:", error);
                toast.error(error.response?.data?.message || "Failed to fetch groups");
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleGroupClick = (selectedGroupId) => {
        navigate(`/group/${selectedGroupId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="text-white">Loading groups...</div>
            </div>
        );
    }

    return (
        <div className="space-y-2 p-4">
            {groups.length === 0 ? (
                <div className="text-center text-white py-8">
                    <IoPeople className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">No groups yet</p>
                </div>
            ) : (
                groups.map((group) => (
                    <div
                        key={group._id}
                        onClick={() => handleGroupClick(group._id)}
                        className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                            group._id === groupId 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                                src={group.groupPhoto || `https://avatar.iran.liara.run/public/boy?username=${group._id}`}
                                alt={group.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-lg truncate">{group.name}</h3>
                            <p className="text-sm text-gray-300 truncate">{group.members?.length || 0} members</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Groups;