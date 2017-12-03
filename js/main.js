var socket = io();

socket.on('update', update);
var n = 1;
function update(data) {
    console.log(n);
    n+=1;
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
    console.log("wah");
    socket.emit('createRoom');
}