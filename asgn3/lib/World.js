class World {
    constructor() {
        this.blocks = [];
        this.width = 32;
        this.height = 32;
        this.depth = 32;
        this.world = [
            [1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,2,1,],
            [2,2,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,2,1,],
            [2,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,3,3,2,1,],
            [3,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,3,2,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,2,2,2,2,1,2,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,2,2,2,2,2,2,1,2,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,2,3,3,3,2,3,3,2,2,2,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,2,3,4,4,3,3,2,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,2,3,3,4,4,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,2,2,3,3,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            [1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,]
        ];
        for (let x = 0; x < this.width; x++) {
            this.blocks.push([]);
            for (let z = 0; z < this.depth; z++) {
                this.blocks[x].push([]);
                for (let y = 0; y < this.height; y++) {
                    this.blocks[x][z].push(0);
                };
            };
        };
        this.blocks[4][4][4] = 1;
        this.blocks[4][4][5] = 1;
    }

    drawMap() {
        let cube = new Cube();
        cube.textureOption = [WALL,WALL,WALL,WALL,WALL,FLOOR];
        cube.color = [1,0,0,1];
        for (let x = 0; x < this.width; x++) {
            for (let z = 0; z < this.depth; z++) {
                let y = this.world[x][z];
                cube.matrix.setTranslate(x * 0.25 - 4,y * 0.25 -1,z * 0.25 - 4);
                cube.matrix.scale(0.25,0.25,0.25);
                cube.render();
            }
        }
    }

    drawBlocks() {
        let cube = new Cube();
        cube.textureOption = [WALL,WALL,WALL,WALL,WALL,WALL];
        for(let x = 0; x < this.width; x++) {
            for(let z = 0; z < this.depth; z++) {
                for(let y = 0; y < this.height; y++) {
                    if (this.blocks[x][z][y] === 1) {
                        cube.matrix.setTranslate(x * 0.25 - 4,y * 0.25 -1,z * 0.25 - 4);
                        cube.matrix.scale(0.25,0.25,0.25);
                        cube.render();
                    }
                }
            }
        }
    }

    placeBlock() {
        let x_eye = Math.floor((camera.eye.elements[0] + 4) * 4);
        let y_eye = Math.floor((camera.eye.elements[1] + 1) * 4);
        let z_eye = Math.floor((camera.eye.elements[2] + 4) * 4);
        
        let x_at = Math.floor((camera.at.elements[0] + 4) * 4);
        let y_at = Math.floor((camera.at.elements[1] + 1) * 4);
        let z_at = Math.floor((camera.at.elements[2] + 4) * 4);


        let dX = x_at - x_eye;
        let dZ = z_at - z_eye;

        if(0 <= x_eye && x_eye < this.width && 0 <= z_eye && z_eye < this.depth && 0 <= y_eye && y_eye < this.height) {
            if(dX == 0 && dZ > 0) {
                this.blocks[x_eye][z_eye+1][y_eye] = 1;
            } else if(dX == 0 && dZ < 0) {
                this.blocks[x_eye][z_eye-1][y_eye] = 1;
            } else if(dX > 0 && dZ == 0) {
                this.blocks[x_eye+1][z_eye][y_eye] = 1;
            } else if(dX < 0 && dZ == 0) {
                this.blocks[x_eye-1][z_eye][y_eye] = 1;
            } else if(dX > 0 && dZ > 0) {
                this.blocks[x_eye+1][z_eye+1][y_eye] = 1;
            } else if(dX > 0 && dZ < 0) {
                this.blocks[x_eye+1][z_eye-1][y_eye] = 1;
            } else if(dX < 0 && dZ > 0) {
                this.blocks[x_eye-1][z_eye+1][y_eye] = 1;
            } else if(dX < 0 && dZ < 0) {
                this.blocks[x_eye-1][z_eye-1][y_eye] = 1;
            }

            console.log("Block placed at: " + x_eye + ", " + y_eye + ", " + z_eye);
        }
        // renderAllShapes();
    }

    removeBlock() {
        let x_eye = Math.floor((camera.eye.elements[0] + 4) * 4);
        let y_eye = Math.floor((camera.eye.elements[1] + 1) * 4);
        let z_eye = Math.floor((camera.eye.elements[2] + 4) * 4);
        
        let x_at = Math.floor((camera.at.elements[0] + 4) * 4);
        let y_at = Math.floor((camera.at.elements[1] + 1) * 4);
        let z_at = Math.floor((camera.at.elements[2] + 4) * 4);

        let dX = x_at - x_eye;
        let dZ = z_at - z_eye;

        if(0 <= x_eye && x_eye < this.width && 0 <= z_eye && z_eye < this.depth && 0 <= y_eye && y_eye < this.height) {
            if(dX == 0 && dZ > 0) {
                this.blocks[x_eye][z_eye+1][y_eye] = 0;
            } else if(dX == 0 && dZ < 0) {
                this.blocks[x_eye][z_eye-1][y_eye] = 0;
            } else if(dX > 0 && dZ == 0) {
                this.blocks[x_eye+1][z_eye][y_eye] = 0;
            } else if(dX < 0 && dZ == 0) {
                this.blocks[x_eye-1][z_eye][y_eye] = 0;
            } else if(dX > 0 && dZ > 0) {
                this.blocks[x_eye+1][z_eye+1][y_eye] = 0;
            } else if(dX > 0 && dZ < 0) {
                this.blocks[x_eye+1][z_eye-1][y_eye] = 0;
            } else if(dX < 0 && dZ > 0) {
                this.blocks[x_eye-1][z_eye+1][y_eye] = 0;
            } else if(dX < 0 && dZ < 0) {
                this.blocks[x_eye-1][z_eye-1][y_eye] = 0;
            }
            console.log("Block removed at: " + x_eye + ", " + y_eye + ", " + z_eye);
        }

        // renderAllShapes();
    }
}