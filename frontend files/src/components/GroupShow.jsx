import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '..';

function GroupShow() {
    const [group, setGroup] = useState(null);

    useEffect(() => {

        const fetchGroup = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/v1/group/`, {
                    withCredentials: true,
                });
                setGroup(res.data);
            } catch (error) {
                console.error("Error fetching group:", error);
            }
        };

        fetchGroup();
    }, []);

    return (
        <div>
            {group ? (
                <div className="p-4 border rounded shadow">
                    <h2 className="text-lg font-bold">{group.name}</h2>
                    <p className="text-sm text-gray-600">Admin ID: {group.admin}</p>
                    <p className="text-sm text-gray-600">Members: {group.members.length}</p>
                </div>
            ) : (
                <p>Loading group...</p>
            )}
        </div>
    );
}

export default GroupShow;