var socket = io();

socket.on('update', update);

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
}

function create() {
}

function update() {
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
        
    if(ptext != text) {
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