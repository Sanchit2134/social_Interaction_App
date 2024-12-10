import { Server } from 'socket.io';
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});
const userSocketMap = {} // {userId: socketId} user ki socket id store karenge yaha.

export const getRecieverSocketId = (receiverId) => userSocketMap[receiverId]; // receiverId se uska socketId nikalne ke liye yeh function banaya hai.

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User connected: UserId = ${userId}, SocketId = ${socket.id}`);
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap)); // getOnlineUsers ek event hai. Jiska kaam object ki keys mei se user id nikal kar online users ko bhejna hai. Jo bi user userSocketMap ki andar hoga vo online hoga.

    socket.on('disconnected', () => {
        if (userId) {
            console.log(`User disconnected: UserId = ${userId}, SocketId = ${socket.id}`);
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    })
})

export { app, server, io} 