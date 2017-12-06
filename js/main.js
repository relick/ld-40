var socket = io();

socket.on('update', update);
socket.on('disconnect', disconnect);
socket.on('ohno', ohno);
socket.on('endgame', endgame);

socket.on('start', startGame);

//serber stuff
function disconnect() {
    $("#mid").html('<p>Server shut down.</p>');
    location.reload();
}

function joinRoom(id) {
    if($("#name").val() === "") {
        alert("You need to enter a name.");
    } else {
        socket.emit('joinRoom', {id:id, name:$("#name").val()});
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

function ohno(obj) {
    alert(obj.err);
}
var initialised = false;
//game logic
var ptext = "";
function update(data) {
    if(data.state === "PREGAME") {
        if(ptext !== data.html) {
            $("#mid").html($(data.html));
            ptext = data.html;
        }
    } else {
        if(initialised) {
            socket.emit('newpos', {pos:players[mynum].sprite.position,
                rot:players[mynum].sprite.rotation,
                spe:players[mynum].speed,
                rspe:players[mynum].rotspeed});
            for(let i = 0; i < data.p.length; i++) {
                if(i !== mynum) {
                    players[i].sprite.position = data.p[i].position;
                    players[i].sprite.rotation = data.p[i].rotation;
                    players[i].speed = data.p[i].speed;
                    players[i].rotspeed = data.p[i].rotspeed;
                }
            }
        }
    }
}

function endgame() {
    game.destroy();
}

var game;
var players;
var mynum;

function Player(colour) {
    this.colour = colour;
    this.speed = 0;
    this.rotspeed = 0;

    this.addSprite = function(sprite, n) {
        this.sprite = sprite;
        this.sprite.tint = colour;
        this.sprite.scale.setTo(0.1,0.1);
        this.sprite.position.setTo(400 + n*30, 300);
        this.sprite.anchor.setTo(0.5,0.5);
        this.sprite.rotation = -3.14159/2
    }
}

function startGame(data) {
    initialised = false;
    $("#mid").html('<div id="options"><a href="javascript:;" onclick="leaveRoom()">Leave Game</a>');
    players = [];
    mynum = data.yournum;
    for(let i = 0; i < data.p.length; i++) {
        players.push(new Player(data.p[i]));
    }
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'mid', { preload: phaserPreload, create: phaserCreate, update: phaserUpdate });
}

function phaserPreload() {
    game.load.image('car', 'images/car.png');
    game.load.image('map', 'images/map.png');
}

var cursors;

function phaserCreate() {
    cursors = game.input.keyboard.createCursorKeys();
    game.world.setBounds(0, 0, 3185, 2400);
    var map = game.add.sprite(0,0, 'map');
    map.scale.setTo(5,5);
    for(let i = 0; i < players.length; i++) {
        players[i].addSprite(game.add.sprite(400, 300, 'car'), i);
    }
    game.camera.roundPx = true;
    socket.emit('newpos', {pos:players[mynum].sprite.position,rot:players[mynum].sprite.rotation,spe:players[mynum].speed});
    initialised = true;
}

function phaserUpdate() {    
    players[mynum].speed -= 0.05;
    if(players[mynum].speed < 0)
        players[mynum].speed = 0;
    if(cursors.up.isDown) {
        players[mynum].speed += 0.1;
    }
    if(players[mynum].speed > 10)
        players[mynum].speed = 10;
    if(cursors.right.isDown) {
        players[mynum].rotspeed = 0.1;
    }
    else if(cursors.left.isDown) {
        players[mynum].rotspeed = -0.1;
    } else {
        players[mynum].rotspeed = 0;
    }

    for(let i = 0; i < players.length; i++) {
        players[i].sprite.position.x += Math.cos(players[i].sprite.rotation)*players[i].speed;
        players[i].sprite.position.y += Math.sin(players[i].sprite.rotation)*players[i].speed;
        players[i].sprite.rotation += players[i].rotspeed;
    }
    game.camera.x = players[mynum].sprite.position.x-400;
    game.camera.y = players[mynum].sprite.position.y-300;
}