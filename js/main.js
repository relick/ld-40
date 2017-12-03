var socket = io();

socket.on('update', update);
function update(data) {
    if(data.state === "PREGAME") {
        $("#mid").html($(data.html));
    } else {
        //game
    }
}

function joinRoom(obj) {
    socket.emit('joinRoom', obj);
}

function startRoom() {
    socket.emit('createRoom');
}