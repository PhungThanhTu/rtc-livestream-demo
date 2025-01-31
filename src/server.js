require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mediasoup = require('mediasoup');

const app = express();

const server = http.createServer(app);

const io = socketIo(server);

// require mediasoup-config
// const mediasoupServer = require('./mediasoup-config');
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log("🧨 new socket has connected, ", socket.id);

    socket.on("room::join", (roomId, callback) => {
        console.log(`🚪 socket ${socket.id} has joined room ${roomId}`);
    });

    socket.on("disconnect", () => {
        console.log(`❌ socket ${socket.id} has disconnected`);
    });
});

const port = process.env.PORT ?? 7999;

server.listen(port, () => {
    console.log(`🏁 the server is listenning on port ${port}`);
});