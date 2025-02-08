import { Server } from 'socket.io';
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

const userSocketMap = {} // {userId: socketId} user ki socket id store karenge yaha.

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    userSocketMap[userId] = socket.id;

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnected', () => {
        if (userId) {
            console.log(`User disconnected: UserId = ${userId}, SocketId = ${socket.id}`);
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});


export { app, server, io} 