var express = require('express'); //http stuff
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chance = new (require('chance'))();

app.use('/js',  express.static('js'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/main.html'); 
});

http.listen(8000, function() {
    console.log("Listening on 8000");
});

function allSockets() {
    return io.sockets.connected;
}

var tickDelay = 100;
setInterval(tick, tickDelay);

/******************************************************************************/
// Event Handlers

io.on('connection', function(socket) {
    if(state != "SETUP") {
        socket.disconnect();
        return;
    }
    socket.player = new Player(socket);
    update(socket);

    socket.on('choice', function(obj) {
        choice(socket.player, obj.option, obj.data);
    });

    socket.on('disconnect', function() {
        players.splice(players.indexOf(socket.player),1);
        console.log("disconnecting " + socket.player.fname);
        updateAll();
    });

});


function Player(socket) {
    this.items = [amnesia];
    if(players.length == 0) { 
        this.items.push(key);
    }
    this.socket = socket;

    this.delay = function(time, choice, cb) {
        var callback = function() {
            cb();
            this.currentDelay = null;
            this.delayChoice = null;
        }.bind(this);

        this.currentDelay = {
            delay:time,
            callback:callback
        };
        timers.push(this.currentDelay);
        this.delayChoice = choice;
    }

    this.giveItem = function(item) {
        if(!this.hasItem(item)) {
            this.items.push(item);
        }
        update(this.socket);
    }

    this.removeItem = function(item) {
        if(this.hasItem(item)) {
            this.items.splice(this.items.indexOf(item));
        }
        update(this.socket);
    }

    this.hasItem = function(item) {
        return this.items.indexOf(item) != -1;
    }

    this.facingToCompass = function() {
        switch(this.facing) {
            case 0:
                return "North";
            case 1:
                return "East";
            case 2:
                return "South";
            case 3:
                return "West";
        }
    }
    this.relativeToDirection = function(rel) {
        return (rel + this.facing) % 4;
    }

    this.relativeDirection = function(compass) {
        var rel = compass - this.facing;
        if(rel < 0) rel += 4;
        switch(rel) {
            case 0:
                return "in front of you";
            case 1:
                return "to your right";
            case 2:
                return "behind you";
            case 3:
                return "to your left";
        }
    }

}

function Tile(x, y) {
    this.x = x;
    this.y = y;
    this.general = function() {
        return "";
    }
    this.here = function(pov) {
        return players.filter((function(pov,p) {
            return p.x == this.x && p.y == this.y && p != pov
        }).bind(this,pov));
    };
    this.people = function(pov) {
        var t = "";
        var h = "";
        var hs = 0;
        var heres = this.here(pov);
        heres.forEach(function(p) {
            if(hs > 0 && heres.length > 2) {
                h += ", ";
            }
            if(hs == heres.length-1 && hs > 0) {
                h += hs == 1 ? " and " : "and";
            }
            h += p.name;
            hs++;
        });
        h += (hs == 1 ? " is":" are") + " here.";

        if (hs > 0) t = h;

        return "<p>"+t+"</p>";
    }
    this.options = function() {
        return [];
    }
}

/******************************************************************************/
// Game Logic

var state;
var players;
var world;
var WORLD_WIDTH = 5;
var WORLD_HEIGHT = 5;

var border_left;
var border_right;
var border_top;
var border_bottom;

var timeToStart;
var timers;

function reset() {
    state = "SETUP";
    timeToStart = {delay:1e20,callback:start};
    timers = [timeToStart];
    players = [];
};

reset();

function start() {
    state = "PLAY";

    // Initialise the world as an empty map
    world = [];
    for(var j=0; j<WORLD_HEIGHT; j++) {
        world[j] = [];
        for(var i=0; i<WORLD_WIDTH; i++) {
            world[j][i] = new Tile(i,j);
        }
    }
    // Add special locations
    locations.forEach(function(l) {
        var x = Math.floor(Math.random()*WORLD_HEIGHT);
        var y = Math.floor(Math.random()*WORLD_WIDTH);
        world[y][x] = l;
        l.x = x;
        l.y = y;
        console.log(x+","+y);
    });

    // Reset boundaries
    border_left = 0;
    border_right = WORLD_WIDTH-1;
    border_top = 0;
    border_bottom = WORLD_HEIGHT-1;
    // Spawn random items
     
    
    // Spawn all players splice random places
    players.map(function(p) {
        p.x = Math.floor(Math.random()*WORLD_HEIGHT);
        p.y = Math.floor(Math.random()*WORLD_HEIGHT);
        p.facing = Math.floor(Math.random() * 4);
    });
    
    // Give each player legs
    players.map(function(p) {
        p.giveItem(legs);
    });
}

function printWorld() {
    for(var j=0; j<WORLD_HEIGHT; j++) {
        console.log(world[j]);
    }
}

function isBorder(x, y, direction) {
    switch(direction) {
        case 0: return y <= border_top;
        case 1: return x >= border_right;
        case 2: return y >= border_bottom;
        case 3: return x <= border_left;
    }
}

function choice(player, number, data) {
    var delay  = data.split('|')[0];
    var choice = data.split('|')[1];
    var info   = data.split('|')[2];

    for(var i=0; i<player.items.length; i++) {
        var item = player.items[i];
        if(item[choice] != undefined) {
            if(delay == 0) {
                item[choice](player,info);
            }
            else {
                player.delay(delay,number,item[choice].bind(this,player,info));
            }
        }
    }   
    update(player.socket);
}

function update(socket) {
    var text = "";
    var options = [];

    switch(state) {
        case "SETUP":
            text += "<p>Welcome to DUBG";
            if(socket.player.fname) text += ", " + socket.player.fname;
            text += "!</p>";
            text += "<p>The game will start in "+Math.floor(timeToStart.delay)+" seconds</p>";
            text += "<p><b>Current players:</b>";
            text += "<ul>";
            if(players.length == 0) { 
                text += "<li>Nobody!</li>";
            }
            else {
                players.map((p) => text += "<li>"+p.name+"</li>");
            }
            text += "</ul></p>";

            break;            
        case "PLAY":
            var res = playUpdate(socket);
            text = res.text;
            options = res.options;
            var delayed = res.delayed;
            break;
        default:
            console.log("Unknown game state " + state);
    }

    if(delayed) {
        socket.emit('update', res);
        return;
    }

    for(var i=0; i<socket.player.items.length; i++) {
        var item = socket.player.items[i]; 
        options = options.concat(item.options(socket.player));
        text += item.text(socket.player);
    }

    socket.emit('update', {text:text, options:options});
}

function playUpdate(socket) {
    if(socket.player.currentDelay != null) {
        return {delayed:true, choice:socket.player.delayChoice, 
                delay:socket.player.currentDelay.delay};
    }
    var text = "";
    var options = [];
    if(socket.player.y == undefined) {
        return {text:'<p>You\'re not in this round.</p>',options:[]};
    }
    var tile = world[socket.player.y][socket.player.x];
    text += tile.general();
    text += tile.people(socket.player);
    options = options.concat(tile.options());

    return {text:text,options:options};
}

function tick() {
    for(var i=timers.length-1; i>=0; i--) {
        var d = timers[i];
        d.delay -= tickDelay/1000;
        if(d.delay <= 0) {
            d.callback();
            timers.splice(i, 1);
        }
    }
    updateAll();
}

function updateAll() {
    var k = allSockets();
    for(var s in k) {
        if(k[s].player != undefined) {
            update(k[s]);
        }
    }
}


/******************************************************************************/
// Items

amnesia = {};
amnesia.text = function(player) {
    return "<b>Please remember who you are.</b>";
};
amnesia.options = function(player) {
    if(player.names == undefined) {
        player.names = [];
        for(var i=0; i<5; i++) {
            var n = chance.name();
            player.names.push({
                label: n + ", a "+chance.profession()+" from "
                    +chance.state({country:'uk', full:true}),
                ret: "0|name|"+n
            });
        }
    }
    return player.names;
};
amnesia.name = function(player,info) {
    player.fname = info.split(" ")[0];
    player.lname = info.split(" ")[1];
    player.name  = info;
    players.push(player);
    player.removeItem(amnesia);
    timeToStart.delay = 10;
    delete player.names;
    updateAll();
};

// Eyes: Used to scope out nearby areas
eyes = {};
eyes.scoped = 0;
eyes.text    = function(player) {
    if(eyes.scoped > 0) {
        
    }
    var t = "";
    return t;
};
eyes.options = function(player) {
    var o = [];
    return o;
};
eyes.scope = function(player) {
    player.scoped = 1; // manhattan distance you can see
}

//Legs: Used to turn and walk, and assess blue wall locations
legs = {};
legs.text    = function(player) {
    var t = "";

    var p = "<p>There is a blue wall";
    var numWalls = 0;
    for(var i=0; i<4; i++) {
        if(isBorder(player.x,player.y,player.relativeToDirection(i))) {
            if(numWalls > 0) {
                p += " and";
            }
            p += " ";
            p += player.relativeDirection(player.relativeToDirection(i));
            numWalls++;
        }
    }
    p += ".</p>";

    if(numWalls > 0) {
        t += p;
    }

    t += "<p>You are facing "+player.facingToCompass()+".</p>";
    return t;
}
legs.options = function(player) {
    var o = [
        {label:'Turn to your left', ret:'0|turn|3'},
        {label:'Turn to your right', ret:'0|turn|1'},
        {label:'Turn around', ret:'0|turn|2'}
    ];
    if(!isBorder(player.x, player.y, player.facing)) {
        o.push({label:'Walk forward', ret:'3|walk|'});
    }
    return o;
}
legs.turn = function(player, info) {
    player.facing = (parseInt(player.facing) + parseInt(info)) % 4;
}
legs.walk = function(player, info) {
    player.scoped = 0;
    if(isBorder(player.x, player.y, player.facing)) {
        return;
    }
    switch(player.facing) {
        case 0: player.y--; break;
        case 1: player.x++; break;
        case 2: player.y++; break;
        case 3: player.x--; break;
    }
}
key = {};
key.options = () => [{label:"Start",ret:'0|begin|'}];
key.text = () => "";
key.begin = function(player,info) {
    start();
}

/******************************************************************************/
// Locations
var geysers = new Tile(0,0);
geysers.general = 
    ()=>"<p>There are many geysers here spouting steam.</p>";
geysers.people = 
    ()=>"<p>You can't see whether anybody is here, because of the steam.</p>";

var locations = [geysers];

/******************************************************************************/
//Helper functions nicked off the internet

