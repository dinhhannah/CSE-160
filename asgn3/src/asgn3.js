// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    void main() {
        if (u_whichTexture == -2) { //default
            gl_FragColor = u_FragColor;
        }
            
        else if (u_whichTexture == -1) { //uv
            gl_FragColor = u_FragColor;
        }
            
        else if (u_whichTexture == 0) { //sky
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        }
            
        else if (u_whichTexture == 1) { //floor
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        }
            
        else if (u_whichTexture == 2) { //wall
            gl_FragColor = texture2D(u_Sampler2, v_UV);
        }
            
        else {
            gl_FragColor = vec4(1, 0, 0, 1); // red error color
        }
    }`

//global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let camera;
let world;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let g_cubeBuffer = null;
let g_pyramidBuffer = null;
let g_triangleBuffer = null;
let g_uvBuffer = null;
// let g_startTime = 0;

// Texture constants
const SKY = 0;
const WALL = 2;
const FLOOR = 1;

// World globals
let g_map = [];
let g_walls = [];
let g_ground;
let g_sky;
let g_skyTexture = null;
let g_floorTexture = null;
let g_wallTexture = null;


//get the canvas and gl context
function setUpWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
}

//compile the shader programs, attach the javascript variables to the GLSL variables
function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position [pointer actual position]
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    //get storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if(!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);

    // Get texture uniforms
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // Get locations first
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');

    // Check them
    if (!u_Sampler0 || !u_Sampler1 || !u_Sampler2) {
        console.log('Failed to get the storage location of samplers');
        return;
    }

    // //set values
    // gl.uniform1i(u_Sampler0, 0);
    // gl.uniform1i(u_Sampler1, 1);
    // gl.uniform1i(u_Sampler2, 2);

    if(!u_Sampler0) {
        console.log('Failed to create sampler0 object');
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if(!u_Sampler1) {
        console.log('Failed to create sampler1 object');
        return false;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if(!u_Sampler2) {
        console.log('Failed to create sampler2 object');
        return false;
    }

    let m = new Matrix4();
    camera = new Camera();
    camera.eye = new Vector3([0, 0, 3]);
    camera.at = new Vector3([0, 0, -100]);
    camera.up = new Vector3([0, 1, 0]);

    world = new World();
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, m.elements);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, m.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, m.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, m.elements);
}

function rotateCamera(ev) {
    if (document.pointerLockElement !== canvas) return;

    let sensitivity = 0.5;
    camera.panLeft(-ev.movementX * sensitivity);
    camera.panUp(-ev.movementY * sensitivity);

    // NUCLEAR TEST: If you move the mouse and the screen stays still,
    // but this log shows DIFFERENT numbers, the issue is 100% the u_ViewMatrix uniform.
    console.log("X-Look:", camera.at.elements[0].toFixed(2));
}
//globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // default white
let g_globalAngle = 0;

let g_animationOn = true;
let g_shiftAnimation = false;

let g_camX = 0;
let g_camY = 0;
let g_dragging = false;
let g_lastMouseX = 0;

// Colors for body parts
let bodyColor = [0.8, 0.6, 0.4, 1.0]; // brown
let neckColor = [0.7, 0.5, 0.3, 1.0]; // darker brown
let headColor = [1.0, 0.8, 0.6, 1.0]; // skin
let snoutColor = [0.9, 0.7, 0.5, 1.0]; // darker skin
let earColor = [1.0, 0.0, 0.0, 1.0]; // red
let thighColor = [0.0, 0.5, 0.0, 1.0]; // dark green
let calfColor = [0.0, 0.7, 0.0, 1.0]; // light green
let g_lastMouseY = 0;

//body control angles
var g_headAngle = [0.0, 0.0, 0.0];

//front leg: thighs
var g_flThighAngle = 10.0;
var g_frThighAngle = 10.0;

//front leg: calves
var g_flCalfAngle = 0.0;
var g_frCalfAngle = 0.0;

//back leg: thighs
var g_blThighAngle = -20.0;
var g_brThighAngle = -20.0;

//back leg: calves
var g_blCalfAngle = 40.0;
var g_brCalfAngle = 40.0;

// Set up actions for HTML UI elements
function addActionsforHTMLUI(){
    //Button Events
    if (document.getElementById('animationButton')) {
        document.getElementById('animationButton').onclick = function() {
            g_animationOn = !g_animationOn;
            g_shiftAnimation = false;
        };
    }
    
    //mouse event
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        mainContainer.addEventListener('click', function(ev) {
            if(ev.shiftKey) {
                g_shiftAnimation = !g_shiftAnimation;
            }
        });
    }
}

function addActionListeners() {
    console.log("Listeners are being initialized right now!");

    canvas.onmousedown = function(ev) {
        canvas.requestPointerLock();
    };

    // We use 'onmousemove' directly on the canvas to ensure focus
    canvas.onmousemove = function(ev) {
        // Log even if NOT locked to see if we get a signal
        // console.log("Direct Canvas Move:", ev.clientX); 

        if (document.pointerLockElement === canvas) {
            // If movementX is 0, we try to calculate it manually as a fallback
            let mx = ev.movementX;
            let my = ev.movementY;

            // EMERGENCY LOG: If this shows up, the mouse is finally talking
            console.log("MOUSE ACTIVE! Delta X:", mx);
            rotateCamera(ev);
        }
    };
}

function rotateCamera(ev) {
    // movementX/Y are the pixels moved since the last mousemove event
    let sensitivity = 0.2; 
    
    // Pan Left/Right based on horizontal mouse movement
    camera.panLeft(-ev.movementX * sensitivity); 
    
    // Pan Up/Down based on vertical mouse movement
    camera.panUp(-ev.movementY * sensitivity); 
}
function keydown(ev){
    
    // Keyboard controls (don't call renderAllShapes here - tick() handles it)
    document.onkeydown = function(ev) {
        if (ev.keyCode == 87) { // W
            camera.moveForward();
        }
        
        else if (ev.keyCode == 83) { // S
            camera.moveBackwards();
        }
        
        else if (ev.keyCode == 65) { // A
            camera.moveLeft();
        }
        
        else if (ev.keyCode == 68) { // D
            camera.moveRight();
        }
        
        else if (ev.keyCode == 81) { // Q
            camera.panLeft();
        }
        
        else if (ev.keyCode == 69) { // E
            camera.panRight();
        }
        
        else if (ev.keyCode == 27) { // ESC
            document.exitPointerLock();
        }
    };
}

function main() {
    setUpWebGL();

    // Force the canvas to be the focusable element
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
    
    connectVariablesToGLSL();
    addActionListeners();
    addActionsforHTMLUI();

    // Initialize textures
    initTextures();

    buildWorld();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.5, 0.8, 1.0);

    document.onkeydown = keydown;

    renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000 - g_startTime;
var g_shapesList = [];

// Dog animation angles
var g_flThighAngle = 0;
var g_frThighAngle = 0;
var g_blThighAngle = 0;
var g_brThighAngle = 0;
var g_headAngle = [0, 0, 0];

function tick(){
    //save current time
    g_seconds = performance.now()/1000 - g_startTime;

    updateAnimationAngles();

    renderAllShapes(); //draw everything

    requestAnimationFrame(tick); //tell browser to update again when it has time
}

function updateAnimationAngles(){
    if (!g_animationOn && !g_shiftAnimation) {
        return;
    }

    if (g_shiftAnimation) {
        // Running animation - front legs move together, back legs move together, faster
        const runSwing = 50 * Math.sin(g_seconds * 4.0);  // Faster (4.0 vs 2.0) and bigger swing
        
        // Front legs move together
        g_flThighAngle = runSwing;
        g_frThighAngle = runSwing;
        
        // Back legs move together (opposite phase)
        g_blThighAngle = -runSwing;
        g_brThighAngle = -runSwing;
        
        // Faster head bobbing
        g_headAngle[0] = 15 * Math.sin(g_seconds * 8);
    }
    
    else {
        // Walking animation (original)
        const swing = 45 * Math.sin(g_seconds * 2.0);
        g_flThighAngle = swing;
        g_frThighAngle = -swing;
        g_blThighAngle = -swing;
        g_brThighAngle = swing;

        // g_flCalfAngle = -swing * 0.5;
        // g_frCalfAngle = swing * 0.5;
        // g_blCalfAngle = -swing * 0.5;
        // g_brCalfAngle = swing * 0.5;
        
        g_headAngle[0] = 10 * Math.sin(g_seconds * 2.5);
    }
}

function buildWorld() {
    g_walls = [];

    // Ground
    g_ground = new Cube();
    g_ground.textureOption = [1, 1, 1, 1, 1, 1];
    g_ground.textureNum = 1;
    g_ground.color = [0.5, 0.8, 0.5, 1.0]; //green
    g_ground.matrix.translate(0, -1.1, 0.0);
    g_ground.matrix.scale(8, 0, 4);
    g_ground.matrix.translate(-0.5, 0, -0.5);
    g_ground.render();

    // Sky
    g_sky = new Cube();
    g_sky.textureOption = [0, 0, 0, 0, 0, 0];
    g_sky.textureNum = 0;
    g_sky.color = [0.5, 0.7, 1.0, 1.0];
    g_sky.matrix.translate(0, -1.2, 0);
    g_sky.matrix.scale(100, 100, 100);
    g_sky.matrix.translate(-0.5, 0, -0.5);
    g_sky.renderSkybox();

    //wall
    let wall = new Cube();
    wall.color = [1, 0, 0, 1];
    wall.textureOption = [2, 2, 2, 2, 2, 2];
    wall.matrix.translate(-0.75, -1, -1.25);
    wall.matrix.scale(0.25, 0.25, 0.25);
    g_walls.push(wall);

    var duration = performance.now() - g_startTime;
    let x_coord = Math.floor((camera.at.elements[0] + 4) * 4);
    let y_coord = Math.floor((camera.at.elements[1] + 1) * 4 - 3);
    let z_coord = Math.floor((camera.at.elements[2] + 4) * 4);

    let x_eye = Math.floor((camera.eye.elements[0] + 4) * 4);
    let y_eye = Math.floor((camera.eye.elements[1] + 1) * 4 - 3);
    let z_eye = Math.floor((camera.eye.elements[2] + 4) * 4);

    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), 'numdot');

}

function drawCube(M, color) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

    if (g_cubeBuffer === null) {
        g_cubeBuffer = gl.createBuffer();
        const vertices = new Float32Array([
            // Front
            0,0,0, 1,1,0, 1,0,0,
            0,0,0, 0,1,0, 1,1,0,
            // Back
            0,0,1, 1,0,1, 1,1,1,
            0,0,1, 1,1,1, 0,1,1,
            // Left
            0,0,0, 0,1,0, 0,1,1,
            0,0,0, 0,1,1, 0,0,1,
            // Right
            1,0,0, 1,1,1, 1,1,0,
            1,0,0, 1,0,1, 1,1,1,
            // Top
            0,1,0, 1,1,0, 1,1,1,
            0,1,0, 1,1,1, 0,1,1,
            // Bottom
            0,0,0, 1,0,1, 1,0,0,
            0,0,0, 0,0,1, 1,0,1
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function drawMultiColorCube(M, colors) {
    gl.disableVertexAttribArray(a_UV);
    // 1. Set Matrices and Texture mode (-2 for solid color)
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
    gl.uniform1i(u_whichTexture, -2);

    // 2. Initialize buffer if it doesn't exist
    if (g_cubeBuffer === null) {
        g_cubeBuffer = gl.createBuffer();
    }

    // 3. Define vertices (Full 36 vertices for a cube)
    const vertices = new Float32Array([
        // Front
        0,0,0, 1,1,0, 1,0,0,  0,0,0, 0,1,0, 1,1,0,
        // Back
        0,0,1, 1,0,1, 1,1,1,  0,0,1, 1,1,1, 0,1,1,
        // Left
        0,0,0, 0,1,0, 0,1,1,  0,0,0, 0,1,1, 0,0,1,
        // Right
        1,0,0, 1,1,1, 1,1,0,  1,0,0, 1,0,1, 1,1,1,
        // Top
        0,1,0, 1,1,0, 1,1,1,  0,1,0, 1,1,1, 0,1,1,
        // Bottom
        0,0,0, 1,0,1, 1,0,0,  0,0,0, 0,0,1, 1,0,1
    ]);

    // 4. Bind and Load data to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW); // Use DYNAMIC if it changes every frame

    // 5. Connect buffer to shader attribute (a_Position)
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // 6. Draw each face with its specific color
    const faces = [
        { color: colors[0], start: 0,  count: 6 }, // Front
        { color: colors[1], start: 6,  count: 6 }, // Back
        { color: colors[2], start: 12, count: 6 }, // Left
        { color: colors[3], start: 18, count: 6 }, // Right
        { color: colors[4], start: 24, count: 6 }, // Top
        { color: colors[5], start: 30, count: 6 }  // Bottom
    ];

    for (let face of faces) {
        gl.uniform4f(u_FragColor, face.color[0], face.color[1], face.color[2], face.color[3]);
        gl.drawArrays(gl.TRIANGLES, face.start, face.count);
    }
}

function drawPyramid(M, color) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

    if (g_pyramidBuffer === null) {
        g_pyramidBuffer = gl.createBuffer();
        let vertices = new Float32Array([
            // Front face (counter-clockwise)
            -0.5, 0, 0.5,   0, 1, 0,   0.5, 0, 0.5,

            // Right face
            0.5, 0, 0.5,  0, 1, 0,    0.5, 0, -0.5,

            // Back face
            0.5, 0, -0.5, 0, 1, 0,    -0.5, 0, -0.5,

            // Left face
            -0.5, 0, -0.5,  0, 1, 0,   -0.5, 0, 0.5,

            // Base (2 triangles, counter-clockwise from bottom)
            -0.5,0,-0.5,  0.5,0,-0.5,  0.5,0,0.5,
            -0.5,0,-0.5,  0.5,0,0.5,  -0.5,0,0.5
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, g_pyramidBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, g_pyramidBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 18); //6 triangles * 3 vertices = 18
}

// Draw a pyramid with different colors for each face
// colors = [front, right, back, left, base]
function drawMultiColorPyramid(M, colors) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

    if (g_pyramidBuffer === null) {
        g_pyramidBuffer = gl.createBuffer();
        let vertices = new Float32Array([
            // Front face (counter-clockwise)
            -0.5, 0, 0.5,   0, 1, 0,   0.5, 0, 0.5,

            // Right face
            0.5, 0, 0.5,  0, 1, 0,    0.5, 0, -0.5,

            // Back face
            0.5, 0, -0.5, 0, 1, 0,    -0.5, 0, -0.5,

            // Left face
            -0.5, 0, -0.5,  0, 1, 0,   -0.5, 0, 0.5,

            // Base (2 triangles, counter-clockwise from bottom)
            -0.5,0,-0.5,  0.5,0,-0.5,  0.5,0,0.5,
            -0.5,0,-0.5,  0.5,0,0.5,  -0.5,0,0.5
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, g_pyramidBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, g_pyramidBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Draw each face with its corresponding color
    const faces = [
        { color: colors[0], start: 0, count: 3 },   // Front
        { color: colors[1], start: 3, count: 3 },   // Right
        { color: colors[2], start: 6, count: 3 },   // Back
        { color: colors[3], start: 9, count: 3 },   // Left
        { color: colors[4], start: 12, count: 6 }   // Base
    ];

    for (let face of faces) {
        gl.uniform4f(u_FragColor, face.color[0], face.color[1], face.color[2], face.color[3]);
        gl.drawArrays(gl.TRIANGLES, face.start, face.count);
    }
}

function renderAllShapes(){
    g_startTime = performance.now();
    camera.updateView();

    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projMat.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMat.elements);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, new Matrix4().elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- BIND ALL TEXTURES HERE ---
    // Unit 0: Sky
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, g_skyTexture);
    gl.uniform1i(u_Sampler0, 0);

    // Unit 1: Floor
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, g_floorTexture);
    gl.uniform1i(u_Sampler1, 2);

    // Unit 2: Wall
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, g_wallTexture);
    gl.uniform1i(u_Sampler2, 1);
    // ------------------------------

    world.drawMap();
    world.drawBlocks();
    
    // Draw the floor - make sure it uses texture 1
    g_ground.render(); 
    
    renderDog();
    g_sky.renderSkybox(); // Use your renderSkybox function

    for (let wall of g_walls) {
        wall.render();
    }

    var duration = performance.now() - g_startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");
}

function renderDog() {
    // body
    let mBody = new Matrix4();
    mBody.translate(-0.35, -0.2, -0.2); 
    let bodyCoords = new Matrix4(mBody);
    mBody.scale(0.7, 0.35, 0.4);
    drawMultiColorCube(mBody, [
        [0.6, 0.5, 0.4, 1.0],  // left side - light grey
        [0.9, 0.8, 0.7, 1.0],  // back - light grey
        [0.8, 0.7, 0.6, 1.0],  // front - darkish grey (shadow)
        [0.5, 0.4, 0.3, 1.0],  // right - darker grey (shadow)
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    // neck
    let mNeck = new Matrix4(bodyCoords);
    mNeck.translate(0, 0.3, 0.1); //center neck on body's edge
    mNeck.rotate(20, 0, 0, 1);
    let neckCoords = new Matrix4(mNeck);
    mNeck.scale(0.15, 0.15, 0.2);
    drawMultiColorCube(mNeck, [
        [0.6, 0.5, 0.4, 1.0],  // front - light grey
        [0.9, 0.8, 0.7, 1.0],  // back - light grey
        [0.9, 0.8, 0.7, 1.0],  // left - darker grey (shadow)
        [0.6, 0.3, 0.4, 1.0],  // right - darker grey (shadow)
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    // head
    let mHead = new Matrix4(neckCoords);
    mHead.translate(-0.09, 0.15, 0); 
    mHead.rotate(g_headAngle[0], 0, 0, 1); // sliders
    let headCoords = new Matrix4(mHead);
    mHead.scale(0.3, 0.25, 0.3);
    mHead.translate(-0.2, 0, -0.15); // Center head
    drawMultiColorCube(mHead, [
        [0.9, 0.8, 0.7, 1.0],  // front - light grey
        [0.9, 0.8, 0.7, 1.0],  // back - light grey
        [0.6, 0.5, 0.4, 1.0],  // left - darker grey (shadow)
        [0.6, 0.5, 0.4, 1.0],  // right - darker grey (shadow)
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    // snout
    let mSnout = new Matrix4(headCoords);
    mSnout.translate(-0.2, 0, 0);
    mSnout.scale(0.2, 0.15, 0.2);
    drawMultiColorCube(mSnout, [
        [0.9, 0.8, 0.7, 1.0],  // front - light grey
        [0.9, 0.8, 0.7, 1.0],  // back - light grey
        [0.6, 0.5, 0.4, 1.0],  // left - darker grey (shadow)
        [0.6, 0.5, 0.4, 1.0],  // right - darker grey (shadow)
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    // ears as pyramids
    let leftEar = new Matrix4(headCoords);
    leftEar.translate(0, 0.25, 0);
    leftEar.rotate(0, 0, 0, 1);
    leftEar.scale(0.1, 0.2, 0.1);
    drawMultiColorPyramid(leftEar, [
        [0.9, 0.8, 0.7, 1.0],  // front - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey (shadow)
        [0.4, 0.3, 0.2, 1.0],  // left - darker grey (shadow)
        [0.4, 0.3, 0.2, 1.0]   // base - very dark grey (shadow)
    ]);

    let rightEar = new Matrix4(headCoords);
    rightEar.translate(0, 0.25, 0.2);
    rightEar.rotate(0, 0, 0, 1);
    rightEar.scale(0.1, 0.2, 0.1);
    drawMultiColorPyramid(rightEar, [
        [0.9, 0.8, 0.7, 1.0],  // front - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey (shadow)
        [0.4, 0.3, 0.2, 1.0],  // left - darker grey (shadow)
        [0.4, 0.3, 0.2, 1.0]   // base - very dark grey (shadow)
    ]);

    // front left leg
    let mFlThigh = new Matrix4(bodyCoords);
    mFlThigh.rotate(g_flThighAngle, 0, 0, 1);
    let flThighCoords = new Matrix4(mFlThigh);
    mFlThigh.scale(0.1, -0.2, 0.1);
    drawMultiColorCube(mFlThigh, [
        [0.6, 0.5, 0.4, 1.0],  // front - darker grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey
        [0.9, 0.8, 0.7, 1.0],  // left - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    let mFlCalf = new Matrix4(flThighCoords);
    mFlCalf.translate(0, -0.2, 0);
    mFlCalf.rotate(g_flCalfAngle, 0, 0, 1);
    mFlCalf.scale(0.08, -0.2, 0.08);
    drawMultiColorCube(mFlCalf, [
        [0.6, 0.5, 0.4, 1.0],  // front - darker grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey
        [0.9, 0.8, 0.7, 1.0],  // left - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    // front right leg
    let mFrThigh = new Matrix4(bodyCoords);
    mFrThigh.translate(0, 0, 0.3);
    mFrThigh.rotate(g_frThighAngle, 0, 0, 1);
    let frThighCoords = new Matrix4(mFrThigh);
    mFrThigh.scale(0.1, -0.2, 0.1);
    drawMultiColorCube(mFrThigh, [
        [0.6, 0.5, 0.4, 1.0],  // front - darker grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey
        [0.9, 0.8, 0.7, 1.0],  // left - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    let mFrCalf = new Matrix4(frThighCoords);
    mFrCalf.translate(0, -0.2, 0);
    mFrCalf.rotate(g_frCalfAngle, 0, 0, 1);
    mFrCalf.scale(0.08, -0.2, 0.08);
    drawMultiColorCube(mFrCalf, [
        [0.6, 0.5, 0.4, 1.0],  // front - darker grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey
        [0.9, 0.8, 0.7, 1.0],  // left - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    // back left leg
    let mBlThigh = new Matrix4(bodyCoords);
    mBlThigh.translate(0.6, 0, 0);
    mBlThigh.rotate(g_blThighAngle, 0, 0, 1);
    let blThighCoords = new Matrix4(mBlThigh);
    mBlThigh.scale(0.1, -0.2, 0.1);
    drawMultiColorCube(mBlThigh, [
        [0.6, 0.5, 0.4, 1.0],  // front - darker grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey
        [0.9, 0.8, 0.7, 1.0],  // left - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    let mBlCalf = new Matrix4(blThighCoords);
    mBlCalf.translate(0, -0.2, 0);
    mBlCalf.rotate(g_blCalfAngle, 0, 0, 1);
    mBlCalf.scale(0.08, -0.2, 0.08);
    drawMultiColorCube(mBlCalf, [
        [0.6, 0.5, 0.4, 1.0],  // front - darker grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey
        [0.9, 0.8, 0.7, 1.0],  // left - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    // back right leg
    let mBrThigh = new Matrix4(bodyCoords);
    mBrThigh.translate(0.6, 0, 0.3);
    mBrThigh.rotate(g_brThighAngle, 0, 0, 1);
    let brThighCoords = new Matrix4(mBrThigh);
    mBrThigh.scale(0.1, -0.2, 0.1);
    drawMultiColorCube(mBrThigh, [
        [0.6, 0.5, 0.4, 1.0],  // front - darker grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey
        [0.9, 0.8, 0.7, 1.0],  // left - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);

    let mBrCalf = new Matrix4(brThighCoords);
    mBrCalf.translate(0, -0.2, 0);
    mBrCalf.rotate(g_brCalfAngle, 0, 0, 1);
    mBrCalf.scale(0.08, -0.2, 0.08);
    drawMultiColorCube(mBrCalf, [
        [0.6, 0.5, 0.4, 1.0],  // front - darker grey
        [0.6, 0.5, 0.4, 1.0],  // back - darker grey
        [0.9, 0.8, 0.7, 1.0],  // left - light grey
        [0.9, 0.8, 0.7, 1.0],  // right - light grey
        [0.9, 0.8, 0.7, 1.0],  // top - light grey
        [0.4, 0.3, 0.2, 1.0]   // bottom - very dark grey (ground shadow)
    ]);
}

//set text of HTML element
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function initTextures() {
    var image0 = new Image();
    image0.onload = function() { 
        g_skyTexture = gl.createTexture(); // Save to global
        loadTexture(gl, 0, g_skyTexture, u_Sampler0, image0); 
    };
    image0.src = '../img/sky.jpg';

    var image1 = new Image();
    image1.onload = function() { 
        g_floorTexture = gl.createTexture(); // Save to global
        loadTexture(gl, 1, g_floorTexture, u_Sampler1, image1); 
    };
    image1.src = '../img/floor.jpg';

    var image2 = new Image();
    image2.onload = function() { 
        g_wallTexture = gl.createTexture(); // Save to global
        loadTexture(gl, 2, g_wallTexture, u_Sampler2, image2); 
    };
    image2.src = '../img/wall.jpg';
}

function loadTexture(gl, n, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    
    // Activate the correct unit
    gl.activeTexture(gl.TEXTURE0 + n);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // CRITICAL: These parameters allow non-power-of-two images to render
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    // Link the sampler to the unit
    gl.uniform1i(u_Sampler, n); 
    console.log("Texture " + n + " is fully loaded and bound.");
}