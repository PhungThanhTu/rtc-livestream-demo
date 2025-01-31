require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { createWorker } = require('./mediasoup.config');

const app = express();

const server = http.createServer(app);

const io = socketIo(server);

// require mediasoup-config
// const mediasoupServer = require('./mediasoup-config');
app.use(express.static('public'));

const { router, worker } = await createWorker();

io.on('connection', (socket) => {
    console.log("🧨 new socket has connected, ", socket.id);

    socket.on('room:join', async ({ username, roomId}) => {
        socket.join(roomId);

        io.to(roomId).emit('room::joined' , { username, roomId });
    });

    socket.on("room::join", async (roomId, callback) => {
        console.log(`🚪 socket ${socket.id} has joined room ${roomId}`);

       const transport = await createWebRtcTransport(router);
       callback({ transportOptions: transport});
    });

    socket.on("disconnect", () => {
        console.log(`❌ socket ${socket.id} has disconnected`);
    });
});

const port = process.env.PORT ?? 7999;

server.listen(port, () => {
    console.log(`🏁 the server is listenning on port ${port}`);
});

async function createWebRtcTransport(router) {
    const transport = await router.createWebRtcTransport({
        listenIps: [
            { ip: '0.0.0.0' , announcedIp: '127.0.0.1'}
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true
    });

    transport.on('dtlsstatechange', dtlsState => {
        if (dtlsState === 'closed') transport.close();
    });

    transport.on('close', () => {
        console.log('Transport closed')
    });

    return transport;
}