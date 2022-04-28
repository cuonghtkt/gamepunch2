const Matter = require('matter-js');
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events,
    Composite = Matter.Composite;
var engine = Engine.create();
engine.world.gravity.y = 0;

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { nanoid } = require('nanoid');
Events.on(engine, 'collisionStart', CollisionEnter);
Events.on(engine, "beforeUpdate", () => {
    var listKey = Object.keys(listBullet);
    if (listKey.length > 0) {

        listKey.forEach(element => {
            var positionXGame = listBullet[element].position.x / 100;
            var positionYGame = listBullet[element].position.y / 100;
            io.emit("move_bullet", element + "|" + positionXGame + "|" + positionYGame);
        });
    }
});
var runner = Runner.create();
// run the engine
Runner.run(runner, engine);
var listPlayer = [];
var listBullet = [];
io.sockets.on('connection', (socket) => {
    //create new player
    var player = Bodies.circle(0, 0, 125, { name: nanoid(), density: 0.5, label: "player" });
    var listTimeSpan = [];
    console.log("player:" + player.name + "connection...");
    Composite.add(engine.world, [player]);
    io.emit('insert', player.name);
    //create orther player
    listPlayer.forEach(element => {
        socket.emit('insert', element.name);
        socket.emit('move', element.name + "|" + element.position.x + "|" + element.position.y);
    });
    listPlayer.push(player);
    socket.on('move', (dataGet) => {
        var data = dataGet.split('|');
        //lag 
        // var timeSpan = { timeSpan: GetTimestamp(), x: player.position.x / 100 + "", y: player.position.y / 100 + "" }
        // listTimeSpan.splice(0, 0, timeSpan);
        // if (listTimeSpan.length >= 50) {
        //     listTimeSpan.splice(50, 1);
        // }
        // //

        // var oldPosition = { x: player.position.x, y: player.position.y };
        // Matter.Body.translate(player, { x: parseFloat(data[0]) * 4, y: parseFloat(data[1]) * 4 });
        // var deltaPosition = { x: player.position.x - oldPosition.x, y: player.position.y - oldPosition.y }


        io.emit('move', player.name + "|" + player.x + "|" + player.y); //+ "|" + JSON.stringify(listTimeSpan[0])
        // io.emit('move', player.name + "|" + (player.position.x / 100) + "|" + (player.position.y / 100));
    });
    socket.on('attack', (dataGet) => {
        var degree = parseFloat(dataGet);
        var radians = (degree * (Math.PI / 180));
        var vetorAttackX = Math.cos(radians);
        var vetorAttackY = Math.sin(radians);
        var offSetXYAttack = 150;
        var positionXBullet = player.position.x + vetorAttackX * offSetXYAttack;
        var positionYBullet = player.position.y + vetorAttackY * offSetXYAttack;
        var buffForce = 5;

        var bullet = Bodies.circle(positionXBullet, positionYBullet, 10, { name: nanoid(), label: "bullet", density: 0.01 });
        listBullet[bullet.name] = bullet;
        io.emit("new_bullet", bullet.name + "|" + bullet.position.x + "|" + bullet.position.y);
        WaitDestroyBullet(bullet.name);
        Composite.add(engine.world, [bullet]);
        Body.applyForce(bullet, { x: bullet.position.x, y: bullet.position.y }, {
            x: Math.cos(radians) / buffForce,
            y: Math.sin(radians) / buffForce
        });
    });
    socket.on('disconnect', () => {
        socket.broadcast.emit('player_disconnect', player.name);
        Composite.remove(engine.world, [player]);
        listPlayer.splice(listPlayer.indexOf(player), 1);
        console.log("player:" + player.name + "disconnect");
    });



});

function DeleteBullet(dataGet) {
    if (listBullet[dataGet] != null) {
        Composite.remove(engine.world, [listBullet[dataGet]]);
    }
    delete listBullet[dataGet];
    io.emit("delete_bullet", dataGet);
}

function CollisionEnter(event) {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
        if (pairs[i].bodyA.label === "bullet") {
            DeleteBullet(pairs[i].bodyA.name)
            console.log(pairs[i].bodyB.name + " lost hp")
        } else if (pairs[i].bodyB.label === "bullet") {
            DeleteBullet(pairs[i].bodyB.name)
        }
    }
}

function GetTimestamp() {
    // var d = new Date();
    // var milisecond = d.getMilliseconds() + "";
    // if (milisecond.length < 2) {
    //     milisecond = "00" + milisecond;
    // } else if (milisecond.length < 3) {
    //     milisecond = "0" + milisecond;
    // }
    // var month = d.getMonth() + "";
    // if (month.length < 2) {
    //     month = "0" + month;
    // }
    // var timeStamp = d.getFullYear() + month + d.getDate() + d.toLocaleTimeString().replace(":", "").replace(":", "") + milisecond;

    const secondsSinceEpoch = Math.round(Date.now())
    return secondsSinceEpoch;
}

function WaitDestroyBullet(dataGet) {
    setTimeout(function() {
        DeleteBullet(dataGet);
    }, 3000);
}
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
http.listen(process.env.PORT || 3000, () => {
    console.log('Connected at 3000');
});