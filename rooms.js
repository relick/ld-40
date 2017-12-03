// Initialisation
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chance = new (require('chance'))();

app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));

var tickDelay;

function startServer(accessPoint, port, source, maxPlayers, ticksPerSec) {
    app.get(accessPoint, function(req, res) {
        res.sendFile(__dirname + source);
    });
    
    http.listen(port, function() {
        console.log("Listening on " + port + " at " + accessPoint);
    });

    tickDelay = 1/ticksPerSec;
    setInterval(tick, tickDelay);

    reset(maxPlayers);
}

function allSockets() {
    return io.sockets.connected;
}

//Matchmaking begin
var pm;

function reset(maxSize) {
    if(pm !== undefined) {
        pm.reset();
        pm.maxGroupSize = maxSize;
    } else {
        pm = new PlayerManager(maxSize);
    }
}

function PlayerManager(maxSize) {
    //Pl shorthand for Players
    this.connPls = [];
    this.freePls = [];
    this.rooms = [];
    this.maxGroupSize = maxSize;

    this.reset = function() {
        var k = allSockets();
        for(i in k) {
            if(k[i] !== undefined) {
                k[i].disconnect();
            }
        }
        this.connPls = [];
        this.freePls = [];
        this.rooms = [];
    };

    this.connectedPlayer = function(socket) {
        connPls.push(socket);
        freePls.push(socket);
    }
    this.updateAll = function() {
        for(i in freePls) {
            if(freePls[i] !== undefined) {
                var text = '<div id="text"><p>Room List</p>';
                text += '<ul>';
                if(groups.length === 0) {
                    text += '<li>None yet! Start one now.</li>'
                } else {
                    rooms.map(function(g) {
                        text += '<li><b>Room [' + g.id + ']:</b> ' + g.numPlayers + ' present. ';
                        if(g.open) {
                            text += '<a href="javascript:;" onclick="joinRoom({id:'+g.id+',name:"wah"})">JOIN</a></li>';
                        } else {
                            text += 'FULL</li>';
                        }
                    });
                }
                text += '</ul></div>';
                text += '<div id="options"><a href="javascript:;" onclick="startRoom()"Start room</a></div>';
                freePls[i].emit({state:"PREGAME", html:text});
            }
        }
    }

    this.startRoom = function(socket) {
        rooms.push(new Room(socket, "DEMONKING"));
        freePls.splice(freePls.indexOf(socket), 1);
    }
/*
    this.addPlayerToRoom = function(socket, groupID, playerName) {
        for(i in groups) {
            if(groups[i] !== undefined) {
                if(groups[i].id === groupID) {
                    if(groups[i].open === true) {
                        if(groups[i].length < maxGroupSize-1) {
                            groups[i].addPlayer(socket, playerName);
                            ungroupedPlayers.splice(ungroupedPlayers.indexOf(socket), 1);
                            return "SUC_ROOM_STILL_OPEN";
                        } else if(groups[i].length === maxGroupSize) {
                            groups[i].addPlayer(socket, playerName);
                            ungroupedPlayers.splice(ungroupedPlayers.indexOf(socket), 1);
                            return "SUC_ROOM_NOW_FULL";
                        } else {
                            return "ERR_ROOM_FULL";
                        }
                    } else {
                        return "ERR_ROOM_CLOSED";
                    }
                } else {
                    return "ERR_ROOM_NOT_FOUND";
                }
            }
        }
    }

    this.updateAll = function() {
        for(i in ungroupedPlayers) {
            if(ungroupedPlayers[i] !== undefined) {

            }
        }
        for(i in groups) {
            if(groups[i] !== undefined) {
                
            }
        }
    }*/
}

io.on('connection', function(socket) {
    console.log("Player connected: " + socket.id);
    pm.connectedPlayer(socket);

    socket.on('createRoom', function() {
        pm.startRoom(socket);
        //socket.emit('waitingForPlayers', {timeout:0});
    });

    socket.on('joinRoom', function(obj) {
        //var r = pm.addPlayerToRo
        //Matchmaking begin
        //var pm;om(socket, obj.id, obj.name);
        /*if(r === "SUC_ROOM_NOW_FULL") {
            pm.emitToRoom(obj.id, 'newPlayer');
            pm.emitToRoom(obj.id, 'start');
            pm.closeRoom(obj.id);
        } else if(r === "SUC_ROOM_STILL_OPEN") {
            pm.emitToRoom(obj.id, 'newPlayer');
        }*/
    });
/*
    socket.on('disconnect', function() {
        console.log("Player disconnected: " + socket.id);
        connectedPlayers.splice(connectedPlayers.indexOf(socket), 1);
        var n = ungroupedPlayers.indexOf(socket);
        if(n === -1) {
            for(i in groups) {
                if(groups[i] !== undefined) {

                }
            }
        } else {
            ungroupedPlayers.splice(ungroupedPlayers.indexOf(socket), 1);
        }
    });*/
});


function Room(firstPlayer, firstPName) {
    this.id = chance.word({syllables:2}).toUpperCase();
    this.players = [{soc:firstPlayer, name:firstPName}];
    this.open = true;
    this.numPlayers = 1;

    this.addPlayer = function(socket, playerName) {
        this.players.push({soc:socket, name:playerName});
        this.numPlayers += 1;
    };

}

function tick() {
    pm.updateAll();
}