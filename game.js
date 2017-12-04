var rooms = require('./rooms')

rooms.startServer('/', 4000, '/main.html', 4, 10, roomUpdate, roomStart, playerLeave);

var p;
function roomUpdate(playersInRoom, roomID) {
    return {state:"PLAYING",p:p};
}

function roomStart(playersInRoom, roomID) {
    p = [];
    var colors = [];
    for(let i = 0; i < playersInRoom.length; i++) {
        switch(i) {
            case 0:
                colors[i] = 0xFFFFFF;
                break;
            case 1:
                colors[i] = 0xFF0000;
                break;
            case 2:
                colors[i] = 0x00FF00;
                break;
            case 3:
                colors[i] = 0x0000FF;
                break;
        }
    }
    for(let i = 0; i < playersInRoom.length; i++) {
        playersInRoom[i].on('newpos', function(obj) {
            if(p[i] === undefined)
                p[i] = {};
            p[i].position = obj.pos;
            p[i].rotation = obj.rot;
            p[i].speed = obj.spe;
        });
        playersInRoom[i].emit('start', {yournum:i, p:colors});
    }
}

function playerLeave() {
    //wham
}