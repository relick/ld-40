var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http)

app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/main.html'); 
});

http.listen(80, function() {
    console.log("Listening on 80");
});

function allSockets() {
    return io.sockets.connected;
}

var ticksPerSec = 10;
var tickDelay = 1/ticksPerSec;
setInterval(tick, tickDelay);

//io Events

io.on('connection', function(socket) {
    console.log("connecting " + socket.id)
    socket.player = new Player(socket);
    new_players.push(socket.player);

    socket.on('searchforgame', function() {
        socket.player.state = "SEARCHING";
        lfg.push(socket);
        if(lfg.length == 4) {
            groups.push(lfg.slice());
            //game_start(groups[groups.length-1]); //impl
            lfg = [];
            new_players.splice(new_players.indexOf(socket), 1);
            console.log(lfg);
            console.log(groups);
        }
    });

    socket.on('disconnect', function() {
        console.log("disconnecting " + socket.id);
    });
});

function Player(socket) {
    this.x = 0;
    this.y = 0;
    this.socket = socket;
    this.state = "SETUP";
    this.group = -1;
}

//Game
var new_players;
var groups;
var latestlfg;

function reset() {
    new_players = [];
    lfg = [];
    groups = [];
}

reset();

function tick() {
    
}