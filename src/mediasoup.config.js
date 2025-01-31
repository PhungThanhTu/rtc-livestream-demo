const mediasoup = require('mediasoup');

const workerSettings = {
    logLevel: 'warn',
    rtcMinPort: 10000,
    rtcMaxPort: 10100
}

const routerOptions = {
    mediaCodecs: [
        {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2
        },
        {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000
        }
    ]
};

const createWorker = async () => {
    const worker = await mediasoup.createWorker(workerSettings);
    worker.on('died', () => {
        console.error('💀 Mediasoup worker has died')
    });

    const router = await worker.createRouter({ mediaCodecs: routerOptions });

    return {
        router,
        worker
    }
}

module.exports = {
    createWorker
}