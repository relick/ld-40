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
var tickDelay = 1/ticksPerSec; //in ms
setInterval(tick, tickDelay);

//io Events

io.on('connection', function(socket) {
    if(state != "TEST") {
        socket.disconnect();
        return;
    }

    socket.on('disconnect', function() {
        console.log("disconnecting" + socket.id);
    });
});

//Game

var state;

function reset() {
    state = "LOAD";

};

reset();