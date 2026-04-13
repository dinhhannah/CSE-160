class Triangle {
    constructor() {
        this.type = "triangle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
    
        // Pass the position of a point to a_Position variable
        // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        gl.uniform1f(u_Size, size);
        
        // If position array has 6 values, it's a custom triangle (generate picture)
        if (this.position.length == 6) {
            drawTriangle(this.position);
        } 

        //else it's a single point click, so calculate the vertices based on size
        else {
            // Draw
            // gl.drawArrays(gl.POINTS, 0, 1);
            let xy = this.position;
            let d = this.size / 200.0;
            drawTriangle([
                xy[0], xy[1],
                xy[0] + d, xy[1],
                xy[0], xy[1] + d
            ]);  
        }
    }
}

function drawTriangle(vertices) {
    // var vertices = new Float32Array([
    //   0, 0.5,   -0.5, -0.5,   0.5, -0.5
    // ]);
    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

// function drawTriangleColor(vertices, rgba) {
//     let tri = new Triangle();
//     // We store the vertices directly in position
//     tri.position = vertices; 
//     // Normalize the 0-255 colors to 0.0-1.0
//     tri.color = [rgba[0]/255, rgba[1]/255, rgba[2]/255, rgba[3]];
    
//     // Push to the global list so renderAllShapes() finds it!
//     g_shapesList.push(tri);
// }