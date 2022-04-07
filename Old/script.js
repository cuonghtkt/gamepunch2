// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine
});
engine.world.gravity.y = 0;
// create two boxes and a ground
var boxA = Bodies.circle(400, 200, 50, { mass: 100 });
var boxB = Bodies.rectangle(450, 50, 80, 80, { mass: 0 });
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
Composite.add(engine.world, [boxA, boxB, ground]);
Matter.Body.translate(boxA, { x: 50, y: 0 });
// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);