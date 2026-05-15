class Triangle {
    constructor() {
        this.type = "triangle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;

        this.buffer = null;
        this.vertices = null;
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
    
        // Draw
        // gl.drawArrays(gl.POINTS, 0, 1);
        let delta = this.size/200.0;
        drawTriangle([xy[0], xy[1], xy[0] - delta/2, xy[1] - delta*Math.sqrt(3)/2, xy[0] + delta/2, xy[1] - delta*Math.sqrt(3)/2]);
    }

    render3D() {
      var n = 3;
      
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      if(this.vertices === null) {
        console.log("Failed to find vertices for triangle");
        return -1;
      }

      if(this.buffer === null) {
        this.buffer = gl.createBuffer();
        
        if (!this.buffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }

      drawTriangle3D(this.vertices, this.buffer);
    }
}

function drawTriangle3D(vertices) {
  var n = vertices.length/3; // The number of vertices

  let vBuffer = gl.createBuffer();
  if (!vBuffer) {
    console.log("Failed to create the vBuffer object");
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// built for interleaved buffers
function drawTriangle3DUV(vBuffer, UVBuffer, vertices, uv) {
  var n = 3; // The number of vertices

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // let FSIZE = vertices.BYTES_PER_ELEMENT;

  // // interleaved with color and coords (color is indices 3-5)
  // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
  
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // uv coords
  gl.bindBuffer(gl.ARRAY_BUFFER, UVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}