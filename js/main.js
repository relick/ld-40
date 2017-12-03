var socket = io();

socket.on('update', update);
socket.on('disconnect', disconnect);

function disconnect() {
    $("#mid").html('Server shut down.');
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
    socket.emit('joinRoom', obj);
}

function startRoom() {
    socket.emit('createRoom');
}