/** @type {import("dom")} */
/** @type {import("socket.io")} */
document
    .getElementById('join-button')
    .addEventListener('click', () => {
        socket.on('connect', () => {
            console.log('Connected to server');
        });
        
        const username = document.getElementById('username').value;
        const roomId = document.getElementById('room-id').value;

        if (username && roomId) {
            const socket = io();
            socket.emit('room:join', {
                username,
                roomId
            });

            document.getElementById('join-screen')
                .style.display = 'none';
            
            document.getElementById('controls')
                .style.display = 'block';
            
            document.getElementById('participant-view')
                .style.display = 'block';

            let localStream;
            let audioEnabled = true;
            let videoEnabled = true;

            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then(stream => {
                    localStream = stream;
                    
                    addParticipantVideo('local', stream);
                    socket.emit('participant::new', { id: 'local' , stream});

                    socket.on('participant::new', ({ id, stream }) => {
                        addParticipantVideo(id, stream);
                    });

                    socket.on('participant:leave', id => {
                        removeParticipantVideo(id);
                    });

                    const videoElement = document.createElement('video');
                    videoElement.srcObject = stream;
                    videoElement.autoplay = true;

                    document.getElementById('participant-view')
                        .appendChild(videoElement);
                })
                .catch(error => {
                    console.error("Error accessing media devices ", error);
                    alert("could not access video or camera, please check permission")
                });
            
            document.getElementById('mute-button')
                .addEventListener('click', () => {
                    audioEnabled = !audioEnabled;
                    localStream.getAudioTracks()[0].enabled = audioEnabled;
                    document.getElementById('mute-button')
                        .textContent = audioEnabled
                            ? 'Mute'
                            : 'Unmute';
                });
            
            document.getElementById('video-button')
                .addEventListener('click', () => {
                    videoEnabled = !videoEnabled;
                    localStream.getVideoTracks()[0].enabled = videoEnabled;

                    document.getElementById('video-button')
                        .textContent = videoEnabled
                        ? 'Stop Video'
                        : 'Start Video';
                });
            
            document.getElementById('leave-button')
                .addEventListener('click', () => {
                    socket.emit('room::leave', { username, roomId });
                    localStream.getTracks().forEach(track => {
                        track.stop();
                    });
                    socket.disconnect();

                    document.getElementById('join-screen')
                        .style.display = 'block';
                    document.getElementById('controls')
                        .style.display = 'none';
                    document.getElementById('participant-view')
                        .style.display = 'none';
                    document.getElementById('participant-view')
                        .innerHTML = '';
                });
                
                socket.on('room::joined', ({roomId, username}) => {
                    console.log(`joined room ${roomId} as ${username}`);
                });

                socket.on('connect_error', (error) => {
                    console.error('socket connection error');
                    console.error(error);
                })
        } else {
            alert("Please enter name and room id")
        }
    });

function addParticipantVideo(id, stream) {
    const videoElement = document.createElement('video');
    videoElement.id = id;
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    document.getElementById('participant-view').appendChild(videoElement);
}

const removeParticipantVideo = (id) => {
    const videoElement = document.getElementById(id);
    if (videoElement) {
      videoElement.srcObject.getTracks().forEach(track => track.stop());
      videoElement.remove();
    }
  };
  
  