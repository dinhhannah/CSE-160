class Cube{
   constructor(){
        this.type = "cube";
        // this.position = [0.0, 0.0, 0.0];  
        this.color = [0.6, 0.6, 0.6, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.vBuffer = null;
        this.UVBuffer = null;
        this.textureOption = [0,0,0,0,0,0]; //array of texture options
    }

   render() {
        if(this.vBuffer === null) {
            this.vBuffer = gl.createBuffer();
            
            if (!this.vBuffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }

        if(this.UVBuffer === null) {
            this.UVBuffer = gl.createBuffer();
            
            if (!this.UVBuffer) {
              console.log("Failed to create the buffer object");
              return -1;
            }
        }

        var rgba = this.color;

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
          
        // pass matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
        drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);

        // Top face
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
        drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);
        
        // Right face
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D([1,0,0, 1,1,0, 1,1,1]);
        drawTriangle3D([1,0,0, 1,1,1, 1,0,1]);

        // Left face
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D([0,0,0, 0,1,1, 0,1,0]);
        drawTriangle3D([0,0,0, 0,0,1, 0,1,1]);

        // Back face
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3D([0,0,1, 1,1,1, 1,0,1]);
        drawTriangle3D([0,0,1, 0,1,1, 1,1,1]);

        // Bottom face
        gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
        drawTriangle3D([0,0,0, 1,0,1, 1,0,0]);
        drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);
    }

    renderFast() {
      let rgba = this.color;
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      let allVerts = []
      
      // front faces
      gl.uniform1i(u_whichTexture, 0);
      allVerts = allVerts.concat([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
      allVerts = allVerts.concat([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);
        
      //back face
      allVerts = allVerts.concat([1.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0]);
      allVerts = allVerts.concat([1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0]);

      // right face
      allVerts = allVerts.concat([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0]);
      allVerts = allVerts.concat([1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0]);

      //left face
      allVerts = allVerts.concat([0.0, 0.0, 1.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0]);
      allVerts = allVerts.concat([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0]);

      // top face
      allVerts = allVerts.concat([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);
      allVerts = allVerts.concat([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);

      //Bottom face
      allVerts = allVerts.concat([0.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0]);
      allVerts = allVerts.concat([0.0, 0.0, 1.0,  0.0, 0.0, 0.0,  1.0, 0.0, 0.0]);

      drawTriangle3D(allVerts);
    }

    renderSkybox() {
        if(this.vBuffer === null) {
            this.vBuffer = gl.createBuffer();
            
            if (!this.vBuffer) {
              console.log("Failed to create buffer object");
              return -1;
            }
        }

        if(this.UVBuffer === null) {
            this.UVBuffer = gl.createBuffer();
            
            if (!this.UVBuffer) {
              console.log("Failed to create buffer object");
              return -1;
            }
        }

        var rgba = this.color;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // front of  cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniform1i(u_whichTexture, this.textureOption);
        
        // front face
        gl.uniform1i(u_whichTexture, this.textureOption[0]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  0.0, 1.0, 0.0], [0,0,     0,1,     1,1]);
        
        // back face
        gl.uniform1i(u_whichTexture, this.textureOption[1]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0,     0,1,     1,1]);

        // right face
        gl.uniform1i(u_whichTexture, this.textureOption[2]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [1.0, 0.0, 1.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0,     0,1,     1,1]);

        // left face
        gl.uniform1i(u_whichTexture, this.textureOption[3]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 1.0], [0,0,     0,1,     1,1]);


        // top face
        gl.uniform1i(u_whichTexture, this.textureOption[4]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [1.0, 1.0, 0.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [1.0, 1.0, 0.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0], [0,0,     0,1,     1,1]);

        // bottom face
        gl.uniform1i(u_whichTexture, this.textureOption[5]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV(this.vBuffer, this.UVBuffer, [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0], [0,0,     0,1,     1,1]);

        gl.deleteBuffer(this.vBuffer);
        gl.deleteBuffer(this.UVBuffer);

    }
}