var socket = io();

//socket.on('request_pos', request_pos);

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'mid', { preload: preload, create: create, update: update });

var cursors;
var cars = [];

function Car(id, sprite) {
    this.id = id;
    this.sprite = sprite;
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.sprite.scale.x = 0.1;
    this.sprite.scale.y = 0.1;
    switch(id) {
        case 0:
            this.sprite.tint = 0xFFFFFF;
        case 1:
            this.sprite.tint = 0xFF0000;
        case 2:
            this.sprite.tint = 0x00FF00;
        case 3:
            this.sprite.tint = 0x0000FF;
    }
    this.speed = 0;
    this.sprite.rotation = -3.14159/2;
}

function preload() {
    game.load.image('car', '/images/car.png');
}

function create() {
    cursors = game.input.keyboard.createCursorKeys();
    cars.push(new Car(0, game.add.sprite(400, 300, 'car')));
}
//var boop = false;

function update() {
    /*if(cursors.up.isDown && !boop) {
        socket.emit('searchforgame');
        boop = true;
    }*/
    cars[0].speed -= 0.05;
    if(cars[0].speed < 0)
        cars[0].speed = 0;
    if(cursors.up.isDown) {
        cars[0].speed += 0.1;
    }
    if(cars[0].speed > 20)
        cars[0].speed = 20;
    if(cursors.right.isDown) {
        cars[0].sprite.rotation += 0.1;
    }
    if(cursors.left.isDown) {
        cars[0].sprite.rotation -= 0.1;
    }

    cars[0].sprite.position.x += Math.cos(pos.angle)*cars[0].speed;
    cars[0].sprite.position.y += Math.sin(pos.angle)*cars[0].speed;
}

/*function request_pos() {
    socket.emit('return_pos', {pos:pos});
}*/

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