var stompClient = null;
var username = null;

function enterChatZoom() {
    username = document.getElementById("nickname").value.trim();

    if (username) {
        document.getElementById("welcome-form").style.display = "none";
        document.getElementById("chat-home").style.display = "block";
        connect();
    } else {
        alert("Por favor, insira um nickname!");
    }
}

function sendMessage() {
    var messageContent = document.getElementById("mensageInput").value.trim();

    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: "CHAT"
        };
        stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
        document.getElementById("mensageInput").value = '';
    }
}


function showMessage(message) {
    var messageElement = document.createElement("div");
    console.log(message.type);
    if (message.type === "JOIN") {
        messageElement.innerText = message.sender + " entrou na sala";
    } else if (message.type === "LEAVE") {
        messageElement.innerText = message.sender + " saiu da sala";
    } else {
        messageElement.innerText = message.sender + " disse: " + message.content;
    }
    console.log('depois: ' + messageElement.innerText);
    document.getElementById("mensagens").appendChild(messageElement);
}

function connect() {
    var socket = new SockJS('https://9e7df17fa210.ngrok.app/chat-websocket', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log("Conectado: " + frame);
        console.log(username)
        stompClient.subscribe("/topic/public", function (messageOutput) {
            showMessage(JSON.parse(messageOutput.body));
        });
        stompClient.send("/app/addUser", {}, JSON.stringify({ sender: username, type: "JOIN" }))
    }, function (error) {
        console.error('Erro ao conectar: ' + error);
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.send("/app/removeUser", {}, JSON.stringify({ sender: username, type: "LEAVE" }));

        stompClient.disconnect(function() {
            console.log("Desconectado do servidor WebSocket.");
        }, function (error) {
            console.error("Erro ao desconectar: " + error);
        });
    }

    document.getElementById("chat-home").style.display = "none";
    document.getElementById("welcome-form").style.display = "block";
}


