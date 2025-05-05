
import {Server} from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST', 'DELETE'],
        credentials: true,
    },
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

const userSocketMap = {}; // {userId->socketId}

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if(userId !== undefined) {
        userSocketMap[userId] = socket.id;
    } 

    // Join group rooms based on user's groups
    if (socket.handshake.query.groups) {
        const groups = JSON.parse(socket.handshake.query.groups);
        groups.forEach(groupId => {
            socket.join(`group:${groupId}`);
        });
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // Handle group message deletion
    socket.on('messageDeleted', ({ groupId, messageId }) => {
        // Broadcast to all users in the group
        io.to(`group:${groupId}`).emit('messageDeleted', { messageId });
    });

    // Handle group message sending
    socket.on('sendGroupMessage', ({ groupId, message }) => {
        // Broadcast to all users in the group
        io.to(`group:${groupId}`).emit('newGroupMessage', message);
    });

    socket.on('disconnect', () => {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { app, io, server };
