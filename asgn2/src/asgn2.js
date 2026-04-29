// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;

    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`

//global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_cubeBuffer = null;
let g_pyramidBuffer = null;

//get the canvas and gl context
function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas, {preserveDrawingBuffer: true});
    // gl = getWebGLContext(canvas);

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    g_vertexBuffer = gl.createBuffer(); // buffer for circle vertices
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
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

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
}

//globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // default white
let g_globalAngle = 0;

let g_animationOn = true;
let g_shiftAnimation = false;

let g_camX = -30;
let g_camY = -50;
let g_camZ = 0;
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

let g_sliderActive = false;

// Set up actions for HTML UI elements
function addActionsforHTMLUI(){
    //Button Events
    if (document.getElementById('animationButton')) {
        document.getElementById('animationButton').onclick = function() {
            g_animationOn = !g_animationOn;
            g_shiftAnimation = false;
        };
    }
    
    // Helper function to create slider handlers
    function createSliderHandler(angleVar, isArray, index) {
        return {
            oninput: function() {
                g_animationOn = false;
                g_shiftAnimation = false;
                g_sliderActive = true;
                if (isArray) {
                    angleVar[index] = Number(this.value);
                } else {
                    window[angleVar] = Number(this.value);
                }
                renderAllShapes();
            },
            onchange: function() {
                g_sliderActive = false;
            }
        };
    }
    
    //Slider Events
    const headX = document.getElementById('xhead-angle');
    if (headX) {
        const handlers = createSliderHandler('g_headAngle', true, 0);
        headX.oninput = handlers.oninput;
        headX.onchange = handlers.onchange;
    }

    const headY = document.getElementById('yhead-angle');
    if (headY) {
        const handlers = createSliderHandler('g_headAngle', true, 1);
        headY.oninput = handlers.oninput;
        headY.onchange = handlers.onchange;
    }

    const headZ = document.getElementById('zhead-angle');
    if (headZ) {
        const handlers = createSliderHandler('g_headAngle', true, 2);
        headZ.oninput = handlers.oninput;
        headZ.onchange = handlers.onchange;
    }

    const flt = document.getElementById('flt-slider');
    if (flt) {
        flt.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_flThighAngle = Number(this.value);
            renderAllShapes();
        };
        flt.onchange = function() {
            g_sliderActive = false;
        };
    }

    const flc = document.getElementById('flc-slider');
    if (flc) {
        flc.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_flCalfAngle = Number(this.value);
            renderAllShapes();
        };
        flc.onchange = function() {
            g_sliderActive = false;
        };
    }

    const frt = document.getElementById('frt-slider');
    if (frt) {
        frt.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_frThighAngle = Number(this.value);
            renderAllShapes();
        };
        frt.onchange = function() {
            g_sliderActive = false;
        };
    }

    const frc = document.getElementById('frc-slider');
    if (frc) {
        frc.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_frCalfAngle = Number(this.value);
            renderAllShapes();
        };
        frc.onchange = function() {
            g_sliderActive = false;
        };
    }

    const blt = document.getElementById('blt-slider');
    if (blt) {
        blt.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_blThighAngle = Number(this.value);
            renderAllShapes();
        };
        blt.onchange = function() {
            g_sliderActive = false;
        };
    }

    const blc = document.getElementById('blc-slider');
    if (blc) {
        blc.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_blCalfAngle = Number(this.value);
            renderAllShapes();
        };
        blc.onchange = function() {
            g_sliderActive = false;
        };
    }

    const brt = document.getElementById('brt-slider');
    if (brt) {
        brt.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_brThighAngle = Number(this.value);
            renderAllShapes();
        };
        brt.onchange = function() {
            g_sliderActive = false;
        };
    }

    const brc = document.getElementById('brc-slider');
    if (brc) {
        brc.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_brCalfAngle = Number(this.value);
            renderAllShapes();
        };
        brc.onchange = function() {
            g_sliderActive = false;
        };
    }

    const xcam = document.getElementById('xcam-angle');
    if (xcam) {
        xcam.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_camX = Number(this.value);
            renderAllShapes();
        };
        xcam.onchange = function() {
            g_sliderActive = false;
        };
    }

    const ycam = document.getElementById('ycam-angle');
    if (ycam) {
        ycam.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_camY = Number(this.value);
            renderAllShapes();
        };
        ycam.onchange = function() {
            g_sliderActive = false;
        };
    }

    const zcam = document.getElementById('zcam-angle');
    if (zcam) {
        zcam.oninput = function() {
            g_animationOn = false;
            g_shiftAnimation = false;
            g_sliderActive = true;
            g_camZ = Number(this.value);
            renderAllShapes();
        };
        zcam.onchange = function() {
            g_sliderActive = false;
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

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsforHTMLUI();

    canvas.onmousedown = function(ev) {
        if (ev.button === 0) {
            g_dragging = true;
            g_lastMouseX = ev.clientX;
            g_lastMouseY = ev.clientY;
        }
    };

    canvas.onmouseup = function() {
        g_dragging = false;
    };

    canvas.onmouseleave = function() {
        g_dragging = false;
    };

    canvas.onmousemove = function(ev){
        let [x, y] = convertCoordinatesEventToGL(ev);
        document.getElementById('coords').innerHTML = `Coords: X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`;
        
        if (g_dragging) {
            let dx = ev.clientX - g_lastMouseX;
            let dy = ev.clientY - g_lastMouseY;
            g_lastMouseX = ev.clientX;
            g_lastMouseY = ev.clientY;

            g_camY -= dx * 0.5;
            g_camX -= dy * 0.5;

            const xcam = document.getElementById('xcam-angle');
            const ycam = document.getElementById('ycam-angle');
            if (xcam) xcam.value = g_camX;
            if (ycam) ycam.value = g_camY;
            renderAllShapes();
        }
    }

    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000 - g_startTime;
var g_shapesList = [];

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
    } else {
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
        
        g_headAngle[0] = 10 * Math.sin(g_seconds * 10);
    }
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
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

// Draw a cube with different colors for each face
// colors = [front, back, left, right, top, bottom]
function drawMultiColorCube(M, colors) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

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
    
    // Draw each face with its corresponding color
    const faces = [
        { color: colors[0], start: 0, count: 6 },   // Front
        { color: colors[1], start: 6, count: 6 },   // Back
        { color: colors[2], start: 12, count: 6 },  // Left
        { color: colors[3], start: 18, count: 6 },  // Right
        { color: colors[4], start: 24, count: 6 },  // Top
        { color: colors[5], start: 30, count: 6 }   // Bottom
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

//based on some data structure that is holding all the information about what to draw, actually draw all the shapes
function renderAllShapes(){
    //check time at start of function
    var startTime = performance.now();

    var viewMat = new Matrix4();
    viewMat.setRotate(g_camX, 1, 0, 0);
    viewMat.rotate(g_camY, 0, 1, 0);
    viewMat.rotate(g_camZ, 0, 0, 1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, viewMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

    //check time at end of function and show on page
    var duration = performance.now() - startTime;
    var len = g_shapesList.length;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");
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