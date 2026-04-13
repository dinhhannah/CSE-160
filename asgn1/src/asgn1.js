// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    // gl_PointSize = 20.0;
    gl_PointSize = u_Size;
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
let u_Size;
let g_vertexBuffer; // for circle to reduce lag

//get the canvas and gl context
function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas, {preserveDrawingBuffer: true});
    // gl = getWebGLContext(canvas);

    g_vertexBuffer = gl.createBuffer();

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if(!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }

}

//
function handleClicks(){

}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // default white
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 10;


// Set up actions for HTML UI elements
function addActionsforHTMLUI(){
    //Button Events (Shape Type)
    document.getElementById('green').onclick = function(){
        g_selectedColor = [0.0, 1.0, 0.0, 1.0];

        document.getElementById('redSlide').value = 0;
        document.getElementById('greenSlide').value = 255;
        document.getElementById('blueSlide').value = 0;

        console.log("Green button clicked")
    };

    document.getElementById('red').onclick = function(){
        g_selectedColor = [1.0, 0.0, 0.0, 1.0];

        document.getElementById('redSlide').value = 255;
        document.getElementById('greenSlide').value = 0;
        document.getElementById('blueSlide').value = 0;

        console.log("Red button clicked")
    };

    document.getElementById('clearButton').onclick = function(){
        g_shapesList = [];
        renderAllShapes();
        console.log("Clear button clicked")
    };

    document.getElementById('pointButton').onclick = function(){
        g_selectedType = POINT;
        console.log("Point button clicked")
    };

    document.getElementById('triButton').onclick = function(){
        g_selectedType = TRIANGLE;
        console.log("Triangle button clicked")
    };

    document.getElementById('circleButton').onclick = function(){
        g_selectedType = CIRCLE;
        console.log("Circle button clicked")
    };

    document.getElementById('generate-pic').onclick = function(){
        generatePicture();
        console.log("Generate Picture button clicked")
    };

    //Slider Events
    document.getElementById('redSlide').oninput = function(){
        g_selectedColor[0] = this.value / 255;
        console.log("Red value:", g_selectedColor[0])
    };

    document.getElementById('greenSlide').oninput = function(){
        g_selectedColor[1] = this.value / 255;
        console.log("Green value:", g_selectedColor[1])
    };
    
    document.getElementById('blueSlide').oninput = function(){
        g_selectedColor[2] = this.value / 255;
        console.log("Blue value:", g_selectedColor[2])
    };

    document.getElementById('sizeSlide').oninput = function(){
        g_selectedSize = this.value;
        console.log("Size value:", g_selectedSize)
    };

    document.getElementById('segmentSlide').oninput = function(){
        g_selectedSegment = this.value;
        console.log("Segment value:", g_selectedSegment)
    };
}

function main() {

    setupWebGL();

    connectVariablesToGLSL();

    // Set up actions for HTML UI elements
    addActionsforHTMLUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = handleClicks;

    // canvas.onmousemove = click; //draws even when moouse isnt pressed

    canvas.onmousemove = function(ev){
        let [x, y] = convertCoordinatesEventToGL(ev);
        document.getElementById('coords').innerHTML = `Coords: X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`;
        
        if (ev.buttons == 1) { // Check if the left mouse button is pressed
            handleClicks(ev);
        }
    }

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []; // The array to store the size of a point

function handleClicks(ev) {
    let [x,y] = convertCoordinatesEventToGL(ev);

    //Create and store a new point
    let point;

    if (g_selectedType === POINT) {
        point = new Point();
    } else if (g_selectedType === TRIANGLE) {
        point = new Triangle();
    } else if (g_selectedType === CIRCLE) {
        point = new Circle();
        point.segments = g_selectedSegment;
    }

    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

//     // Store the coordinates to g_points array
//     g_points.push([x, y]);

//     // Store the color to g_colors array
//     g_colors.push(g_selectedColor.slice());

//     // Store the size to g_sizess array
//     g_sizes.push(g_selectedSize);
    
// //   // Store the coordinates to g_points array
// //   if (x >= 0.0 && y >= 0.0) {      // First quadrant
// //     g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
// //   } else if (x < 0.0 && y < 0.0) { // Third quadrant
// //     g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
// //   } else {                         // Others
// //     g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
// //   }

  //draw every shape that's supposed to be on canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}

//based on some data structure that is holding all the information about what to draw, actually draw all the shapes
function renderAllShapes(){

    //check time at start of function
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // var len = g_points.length;
    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    //check time at end of function and show on page
    var duration = performance.now() - startTime;
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

function generatePicture() {
    // clear canvas
    g_shapesList = []; 

    let shapes = [

        //crystal gem, or maybe the plumbob from Sims idk

        // Bottom Left Face (Dark)
        { points: [0.0, 0.0,  -0.2, 0.1,   0.0, -0.5], color: [56, 102, 48, 1.0] },
        // Bottom Right Face (Darkest)
        { points: [0.0, 0.0,   0.2, 0.1,   0.0, -0.5], color: [17, 86, 52, 1.0] },
        
        // Top Left Face (Lightest)
        { points: [0.0, 0.0,  -0.2, 0.1,   0.0, 0.6],  color: [150, 225, 200, 1.0] }, 
        // Top Right Face (Medium)
        { points: [0.0, 0.0,   0.2, 0.1,   0.0, 0.6],  color: [120, 225, 200, 1.0] },

        // Left Bar of H
        { points: [-0.08, 0.35,   -0.06, 0.35,   -0.15, 0.1], color: [10, 50, 10, 1.0] },
        // // Right Bar of H
        { points: [-0.05, 0.35,   -0.03, 0.35,   -0.10, 0.1], color: [10, 50, 10, 1.0] },
        // // Middle Bar of H
        { points: [-0.1, 0.23,   -0.09, 0.25,   -0.06, 0.2], color: [10, 50, 10, 1.0] },

        //D
        { points: [0.02, 0.35,   0.04, 0.35,   0.05, 0.1], color: [10, 50, 10, 1.0] },
        { points: [0.02, 0.35,   0.04, 0.35,   0.12, 0.25], color: [10, 50, 10, 1.0] },
        { points: [0.05, 0.1,   0.05, 0.15,   0.12, 0.25], color: [10, 50, 10, 1.0] },
        
        //left side face

        //right side face

        // // Front face (Light)
        // { points: [0.0, 0.0,  -0.15, 0.25,   0.15, 0.25], color: [220, 225, 225, 1.0] },
        // { points: [0.0, 0.3,  -0.15, 0.25,   0.15, 0.25], color: [220, 225, 225, 1.0] },


        //front 
        // //Top faces
        // { points: [0.0, 0.3,  -0.15, 0.25,   0.0, 0.7], color: [130, 225, 220, 1.0] },
        // { points: [0.0, 0.3,  0.15, 0.25,   0.0, 0.7], color: [1, 200, 220, 1.0] },
        
        //etc if i work on this more i give up
    ]

    for (let s of shapes) {
    let t = new Triangle();
    t.position = s.points;

    //normalize colors
    t.color = [s.color[0]/255, s.color[1]/255, s.color[2]/255, s.color[3]];
    g_shapesList.push(t);
    }

    renderAllShapes();
}

function drawTriangleFan(vertices) { //for circle
    var n = vertices.length / 2; 

    //create buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    
    //upload all vertices
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    //point a_Position to the buffer
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    //draw all segments
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
}