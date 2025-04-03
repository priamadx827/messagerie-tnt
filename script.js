// Variables de base
let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');

// Envoie d'un message
function sendMessage() {
    const message = messageInput.value;
    if (message.trim()) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'me');
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);
        messageInput.value = '';
        sendChannel.send(message); // Envoi via WebRTC
    }
}

// Réception du message
function receiveMessage(event) {
    const message = event.data;
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
}

// Créer la connexion WebRTC
function setupWebRTC() {
    const servers = null; // Pas de STUN/TURN pour cette démo
    localConnection = new RTCPeerConnection(servers);
    sendChannel = localConnection.createDataChannel('sendDataChannel');
    sendChannel.onopen = () => console.log('Channel opened');
    sendChannel.onclose = () => console.log('Channel closed');
    sendChannel.onmessage = receiveMessage;

    remoteConnection = new RTCPeerConnection(servers);
    remoteConnection.ondatachannel = (event) => {
        receiveChannel = event.channel;
        receiveChannel.onmessage = receiveMessage;
    };
}

// Demander à l'utilisateur de partager un code
function startConnection() {
    setupWebRTC();
    localConnection.createOffer()
        .then(offer => {
            localConnection.setLocalDescription(offer);
            remoteConnection.setRemoteDescription(offer);
            return remoteConnection.createAnswer();
        })
        .then(answer => {
            remoteConnection.setLocalDescription(answer);
            localConnection.setRemoteDescription(answer);
        });
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// On initialise la connexion WebRTC à l'ouverture
startConnection();
