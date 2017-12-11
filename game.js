var rooms = require('./rooms')

rooms.startServer('/', 4000, '/main.html', 4, 10, roomUpdate, roomStart, playerLeave);

var r = [];
function roomUpdate(playersInRoom, roomID) {
    return {state:"PLAYING",p:r[roomID]};
}

function roomStart(playersInRoom, roomID) {
    r[roomID] = [];
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
            if(r[roomID][i] === undefined) {
                r[roomID][i] = {};
                r[roomID][i].alpha = 1;
            }
            r[roomID][i].position = obj.pos;
            r[roomID][i].rotation = obj.rot;
            r[roomID][i].speed = obj.spe;
            r[roomID][i].rotspeed = obj.rspe;
        });
        playersInRoom[i].emit('start', {yournum:i, p:colors});
        //playersInRoom[i].on('playerLeave', playerLeave);
    }
}

function playerLeave(obj) {
    r[obj.roomID][obj.id].alpha = 0;
}