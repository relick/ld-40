var socket = io();

socket.on('update', update);
socket.on('disconnect', disconnect);

function disconnect() {
    $("#mid").html('<p>Server shut down.</p>');
    location.reload();
}

var ptext = "";
function update(data) {
    if(data.state === "PREGAME") {
        if(ptext !== data.html) {
            $("#mid").html($(data.html));
            ptext = data.html;
        }
    } else {
        //game
    }
}

function joinRoom(obj) {
    if(obj.name === "") {
        alert("You need to enter a name.");
    } else {
        socket.emit('joinRoom', obj);
    }
}

function startRoom() {
    if($("#name").val() === "") {
        alert("You need to enter a name.");
    } else {
        socket.emit('createRoom', {name:$("#name").val()});
    }
}

function leaveRoom() {
    socket.emit('leaveRoom');
}