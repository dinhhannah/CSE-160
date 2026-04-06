// DrawTriangle.js (c) 2012 matsuda

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.strokeStyle = color; //set color of drawing

  ctx.beginPath(); //start drawing
  
  ctx.moveTo(200, 200); //move to center of canvas

  //calculate the end point (scale by 20, subtract/add from center)
  let endX = 200 + v.elements[0] * 20;
  let endY = 200 - v.elements[1] * 20; //y increases downwards on canvas

  //draw line
  ctx.lineTo(endX, endY);
  ctx.stroke(); 
}

function handleDrawEvent(){
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  let x1 = parseFloat(document.getElementById('v1x').value);
  let y1 = parseFloat(document.getElementById('v1y').value);

  let x2 = parseFloat(document.getElementById('v2x').value);
  let y2 = parseFloat(document.getElementById('v2y').value);

  //create v1 & v2 using input values
  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);
  
  //draw v1 & v2
  drawVector(v1, "red")
  drawVector(v2, "blue")
}

function handleDrawOperationEvent(){
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  let x1 = parseFloat(document.getElementById('v1x').value) || 0;
  let y1 = parseFloat(document.getElementById('v1y').value) || 0;
  let x2 = parseFloat(document.getElementById('v2x').value) || 0;
  let y2 = parseFloat(document.getElementById('v2y').value) || 0;

  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);

  let op = document.getElementById('operation').value;
  let scalar = parseFloat(document.getElementById('scalar').value) || 0;


  if (op === "add") {
    let v3 = v1.add(v2); 
    drawVector(v3, "green");
  } 

  else if (op === "subtract") {
    let v3 = v1.sub(v2);
    drawVector(v3, "green");
  } 

  else if (op === "multiply") {
    let v3 = v1.mul(scalar);
    let v4 = v2.mul(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } 

  else if (op === "divide") {
    if (scalar !== 0) {
      let v3 = v1.div(scalar);
      let v4 = v2.div(scalar);
      drawVector(v3, "green");
      drawVector(v4, "green");
    }
  }

  else if (op === "magnitude") {
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    console.log("Magnitude of v1:", mag1);
    console.log("Magnitude of v2:", mag2);
  }

  else if (op === "normalize") {
    let v3 = v1.normalize();
    let v4 = v2.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
  }

  let v1_og = new Vector3([x1, y1, 0]);
  let v2_og = new Vector3([x2, y2, 0]);
  drawVector(v1_og, "red");
  drawVector(v2_og, "blue");

  if (op === "area"){
    a = areaTriangle(v1, v2);
    console.log("Area of the triangle:", a);
  }
}

function areaTriangle(v1, v2) {
  // calculate area of triangle formed by 2 vectors
  let crossProd = Vector3.cross(v1, v2);
  let area = 0.5 * crossProd.magnitude();
  
  return area;
}




function main() {  
  console.log("Main is running");

  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a black rectangle
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  let v1 = new Vector3([1, 2, 0])
  drawVector(v1, 'red')
}