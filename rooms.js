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

exports.startServer = function(accessPoint, port, source, maxPlayers, ticksPerSec) {
    app.get(accessPoint, function(req, res) {
        res.sendFile(__dirname + source);
    });
    
    http.listen(port, function() {
        console.log("Listening on " + port + " at " + accessPoint);
    });

    tickDelay = 1000/ticksPerSec;
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
        this.connPls.push(socket);
        this.freePls.push(socket);
    };

    this.updateAll = function() {
        //Room list for those not in a room
        for(i in this.freePls) {
            if(this.freePls[i] !== undefined) {
                var text = '<div id="text"><p>Room List</p>';
                text += '<ul>';
                if(this.rooms.length === 0) {
                    text += '<li>None yet! Start one now.</li>'
                } else {
                    this.rooms.map(function(r) {
                        text += '<li><b>Room [' + r.id + ']:</b> ' + r.numPlayers + ' present. ';
                        if(r.open) {
                            text += '<a href="javascript:;" onclick="joinRoom(\''+r.id+'\')">JOIN</a></li>';
                        } else {
                            text += 'PLAYING</li>';
                        }
                    });
                }
                text += '</ul></div>';
                text += '<div id="options">Name: <input type="text" id="name" /> <a href="javascript:;" onclick="startRoom()">Start room</a></div>';
                this.freePls[i].emit('update', {state:"PREGAME", html:text});
            }
        }

        //Player list for those in a waiting room
        for(r in this.rooms) {
            if(this.rooms[r] !== undefined) {
                if(this.rooms[r].open) {
                    var text = '<div id="text"><p>Player List for Room <b>'+this.rooms[r].id+'</b></p>';
                    text += '<ul>';
                    this.rooms[r].players.map(function(p) {
                        text += '<li>'+p.name+'</li>';
                    });
                    text += '</ul></div>';
                    text += '<div id="options"><a href="javascript:;" onclick="leaveRoom()">Leave room</a></div>';
                    
                    this.rooms[r].players.map(function(k) {k.emit('update', {state:"PREGAME", html:text})});
                }
            }
        }

        //Game update for those playing
    };

    this.startRoom = function(socket, name) {
        if(this.freePls.indexOf(socket) !== -1) {
            this.rooms.push(new Room(socket, name));
            this.freePls.splice(this.freePls.indexOf(socket), 1);
        } else {
            console.log(socket.id + " tried to startRoom but is already in one!");
            socket.disconnect();
        }
    };

    this.leaveRoom = function(socket) {
        for(i in this.rooms) {
            if(this.rooms[i] !== undefined) {
                if(this.rooms[i].players.indexOf(socket) !== -1) {
                    var r = this.rooms[i].removePlayer(socket);
                    if(r === 0) {
                        this.rooms.splice(i, 1);
                    }
                    this.freePls.push(socket);
                    return;
                }
            }
        }
        console.log(socket.id + " tried to leave room but not in room!");
    };

    this.addPlayerToRoom = function(socket, groupID, playerName) {
        if(this.freePls.indexOf(socket) === -1) {
            return "ERR_PLAYER_IN_ROOM";
        }
        for(i in this.rooms) {
            if(this.rooms[i] !== undefined) {
                console.log(this.rooms[i].id);
                console.log(groupID);
                if(this.rooms[i].id === groupID) {
                    if(this.rooms[i].open === true) {
                        if(this.rooms[i].numPlayers < this.maxGroupSize-1) {
                            this.rooms[i].addPlayer(socket, playerName);
                            this.freePls.splice(this.freePls.indexOf(socket), 1);
                            return "SUC_ROOM_STILL_OPEN";
                        } else if(this.rooms[i].numPlayers === this.maxGroupSize-1) {
                            this.rooms[i].addPlayer(socket, playerName);
                            this.freePls.splice(this.freePls.indexOf(socket), 1);
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
    };

    this.disconnectedPlayer = function(socket) {
        if(this.freePls.indexOf(socket) === -1) {
            for(i in this.rooms) {
                if(this.rooms[i] !== undefined) {
                    for(j in this.rooms[i].players) {
                        if(this.rooms[i].players[j] === socket) {
                            var r = this.rooms[i].removePlayer(socket);
                            if(r === 0) {
                                this.rooms.splice(i, 1);
                            }
                        }
                    }
                }
            }
        } else {
            this.freePls.splice(this.freePls.indexOf(socket), 1);
        }
        this.connPls.splice(this.connPls.indexOf(socket), 1);
    };
}

io.on('connection', function(socket) {
    console.log("Player connected: " + socket.id);
    pm.connectedPlayer(socket);

    socket.on('createRoom', function(obj) {
        pm.startRoom(socket, obj.name);
        //socket.emit('waitingForPlayers', {timeout:0});
    });

    socket.on('joinRoom', function(obj) {
        var r = pm.addPlayerToRoom(socket, obj.id, obj.name);
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

    socket.on('leaveRoom', function() {
        pm.leaveRoom(socket);
    });

    socket.on('disconnect', function() {
        console.log("Player disconnected: " + socket.id);
        pm.disconnectedPlayer(socket);
    });
});


function Room(firstPlayer, firstPName) {
    this.id = chance.word({syllables:2}).toUpperCase();
    firstPlayer.name = firstPName;
    this.players = [firstPlayer];
    this.open = true;
    this.numPlayers = 1;

    this.addPlayer = function(socket, playerName) {
        socket.name = playerName;
        this.players.push(socket);
        this.numPlayers += 1;
    };

    this.removePlayer = function(socket) {
        this.players.splice(this.players.indexOf(socket), 1);
        this.numPlayers -= 1;
        if(this.numPlayers === 0) {
            return 0;
        } else {
            return 1;
        }
    };
}

function tick() {
    pm.updateAll();
}