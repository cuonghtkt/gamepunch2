// module aliases
const Matter = require('matter-js');
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();
engine.world.gravity.y = 0;
// create two boxes and a ground
// var boxA = Bodies.rectangle(400, 200, 80, 80, { mass: 100 });
// var boxB = Bodies.rectangle(450, 50, 80, 80, { mass: 0 });
// var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
// Composite.add(engine.world, [boxA, boxB, ground]);
// run the renderer


const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { nanoid } = require('nanoid');
Events.on(engine, 'collisionActive', collision);
Events.on(engine, 'collisionStart', () => {
    console.log('collider');
});
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);
var listPlayer = [];
io.sockets.on('connection', (socket) => {
    //create new player
    var player = Bodies.circle(0, 0, 125, { name: nanoid() });
    Composite.add(engine.world, [player]);
    io.emit('insert', player.name);
    //create orther player
    listPlayer.forEach(element => {
        socket.emit('insert', element.name);
        socket.emit('move', element.name + "|" + element.position.x + "|" + element.position.y);
    });
    listPlayer.push(player);

    socket.on('move', (dataGet) => {
        const data = dataGet.split('|');
        Matter.Body.translate(player, { x: parseFloat(data[0]) * 3, y: parseFloat(data[1]) * 3 });
        // Body.applyForce(player, { x: player.position.x, y: player.position.y }, { x: 0.003 * data[0], y: 0.003 * data[1] });
        // if (player.force >= 0.003 * data[0]) {
        //     player.force = 0.003 * data[0];
        // }
        io.emit('move', player.name + "|" + (player.position.x / 100) + "|" + (player.position.y / 100));
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('player_disconnect', player.name);
        Composite.remove(engine.world, [player]);
        listPlayer.splice(listPlayer.indexOf(player), 1);
    });



});

function collision(event) {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
        io.emit('move', pairs[i].bodyA.name + "|" + (pairs[i].bodyA.position.x / 100) + "|" + (pairs[i].bodyA.position.y / 100));
        io.emit('move', pairs[i].bodyB.name + "|" + (pairs[i].bodyB.position.x / 100) + "|" + (pairs[i].bodyB.position.y / 100));
    }
}
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
http.listen(process.env.PORT || 3000, () => {
    console.log('Connected at 3000');
});
// class Player {
//     constructor() {
//         this.collider =;
//     }
// }