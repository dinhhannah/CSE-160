class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [0.5, 0.5, 0.5, 0.5];
        this.matrix = new Matrix4();
        this.vBuffer = null;
        this.UVBuffer = null;
        this.textureOption = [0,0,0,0,0,0];
    }

    render() {
        var rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform1i(u_whichTexture, 1);

        // front of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // front face
        gl.uniform1i(u_whichTexture, this.textureOption[0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0,     0,1,     1,1]);
        
        // back face
        gl.uniform1i(u_whichTexture, this.textureOption[1]);
        drawTriangle3DUV([1.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0], [0,0,     0,1,     1,1]);

        // right face
        gl.uniform1i(u_whichTexture, this.textureOption[2]);
        drawTriangle3DUV([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0], [0,0,     0,1,     1,1]);

        // left face
        gl.uniform1i(u_whichTexture, this.textureOption[3]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0], [0,0,     0,1,     1,1]);

        // top face
        gl.uniform1i(u_whichTexture, this.textureOption[4]);
        drawTriangle3DUV([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0,     0,1,     1,1]);

        // bottom face
        gl.uniform1i(u_whichTexture, this.textureOption[5]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0], [0,0,     1,1,     1,0]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 0.0, 0.0,  1.0, 0.0, 0.0], [0,0,     0,1,     1,1]);
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

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, g_skyTexture);
        gl.uniform1i(u_Sampler0, 0); // Force the sampler to look at Unit 0

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.disable(gl.CULL_FACE);

        // front of the cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // front face
        gl.uniform1i(u_whichTexture, this.textureOption[0]);
        drawTriangle3DUV([1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  0.0, 1.0, 0.0], [0,0,  0,1,  1,1]);
        
        // back face
        gl.uniform1i(u_whichTexture, this.textureOption[1]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0,  0,1,  1,1]);

        // right face
        gl.uniform1i(u_whichTexture, this.textureOption[2]);
        drawTriangle3DUV([1.0, 0.0, 1.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0,  0,1,  1,1]);

        // left face
        gl.uniform1i(u_whichTexture, this.textureOption[3]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0], [0,0,  1,1,   1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 1.0], [0,0,  0,1,  1,1]);

        // top face
        gl.uniform1i(u_whichTexture, this.textureOption[4]);
        drawTriangle3DUV([1.0, 1.0, 0.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([1.0, 1.0, 0.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0], [0,0,  0,1,  1,1]);

        // bottom face
        gl.uniform1i(u_whichTexture, this.textureOption[5]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0], [0,0,  0,1,  1,1]);
        
        gl.enable(gl.CULL_FACE); // Turn it back on for the dog/walls
    }

    renderFast() {
      let rgba = this.color;

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      let allVerts = []
      
      gl.uniform1i(u_whichTexture, 0);
      allVerts = allVerts.concat([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
      allVerts = allVerts.concat([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);

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

      //bottom face
      allVerts = allVerts.concat([0.0, 0.0, 1.0,  1.0, 0.0, 0.0,  1.0, 0.0, 1.0]);
      allVerts = allVerts.concat([0.0, 0.0, 1.0,  0.0, 0.0, 0.0,  1.0, 0.0, 0.0]);

    //   drawTriangle3D(allVerts);
    }
}