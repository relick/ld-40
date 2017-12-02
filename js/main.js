var socket = io();

socket.on('update', update);

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var cursors;
var car;
var pos = {speed:0,angle:3.14159/2,dir_x:0,dir_y:1};

function preload() {
    game.load.image('car', '/images/car.png');
}

function create() {
    cursors = game.input.keyboard.createCursorKeys();
    car = game.add.sprite(0, 0, 'car');
    car.tint = 0xFFFF00;
}
//var boop = false;

function update() {
    /*if(cursors.up.isDown && !boop) {
        socket.emit('searchforgame');
        boop = true;
    }*/
    pos.speed -= 0.05;
    if(pos.speed < 0)
        pos.speed = 0;
    if(cursors.up.isDown) {
        pos.speed += 0.1;
    }
    if(cursors.right.isDown) {
        pos.angle -= 0.1;
        pos.dir_x = Math.cos(pos.angle);
        pos.dir_y = Math.sin(pos.angle);
    }
    if(cursors.left.isDown) {
        angle += 0.1;
        pos.dir_x = Math.cos(pos.angle);
        pos.dir_y = Math.sin(pos.angle);
    }

    car.rotation = pos.angle;
    //car.position.x += pos.dir_x*pos.speed;
    //car.position.y += pos.dir_y*pos.speed;
    car.position.x = 1;
}
/*function update(data) {
    if(data.delayed) {
        $(".option").addClass("delayed");
        $(".time").remove();
        $(".owrap:nth-child("+(data.choice+1)+")").append(
                $("<span class='time'>("+Math.floor(data.delay)+")</span>"));
        delayed=true;
        return;
    }
    var text = data.text;
    var options = data.options;
        
    if(
        ptext != text) {
        $("#text").html(text);
        ptext = text;
    }

    if(!poptions || !sameOptions(options, poptions) || delayed) {
        $("#options").empty();
        var o=0;
        options.map(function(option) {
             var x = `<p class="owrap"><a href="#" class="option"
                 onclick="send(`+o+",'"+option.ret+`')">`
                +option.label+"</a></p>";
             $("#options").append($(x));
             o++;
        });
        poptions = options;
    }
    delayed = false;
}

function send(option, data) {
    if(delayed) return;
    socket.emit('choice', {option:option, data:data});
}

function sameOptions(o, p) {
    if(o.length != p.length) return false;
    for(var i=0; i<o.length; i++) {
        if(o[i].label != p[i].label) {
            return false;
        }
        return true;
    }
}
*/