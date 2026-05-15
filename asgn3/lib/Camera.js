class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at  = new Vector3([0, 0, -100]);
        this.up  = new Vector3([0, 1, 0]);
        
        this.viewMat = new Matrix4();
        this.projMat = new Matrix4();
        
        // Perspective: 60 degree FOV, Near plane 0.1, Far plane 1000
        this.projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 1000);
        
        this.speed = 0.2; 
    }

    updateView() {
        this.viewMat.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    // --- Movement Logic ---

    moveForward() {
        let f = this.getForwardVector();
        this.eye.elements[0] += f[0] * this.speed; this.at.elements[0] += f[0] * this.speed;
        this.eye.elements[1] += f[1] * this.speed; this.at.elements[1] += f[1] * this.speed;
        this.eye.elements[2] += f[2] * this.speed; this.at.elements[2] += f[2] * this.speed;
    }

    moveBackwards() {
        let f = this.getForwardVector();
        this.eye.elements[0] -= f[0] * this.speed; this.at.elements[0] -= f[0] * this.speed;
        this.eye.elements[1] -= f[1] * this.speed; this.at.elements[1] -= f[1] * this.speed;
        this.eye.elements[2] -= f[2] * this.speed; this.at.elements[2] -= f[2] * this.speed;
    }

    moveLeft() {
        let s = this.getSideVector();
        this.eye.elements[0] += s[0] * this.speed; this.at.elements[0] += s[0] * this.speed;
        this.eye.elements[1] += s[1] * this.speed; this.at.elements[1] += s[1] * this.speed;
        this.eye.elements[2] += s[2] * this.speed; this.at.elements[2] += s[2] * this.speed;
    }

    moveRight() {
        let s = this.getSideVector();
        this.eye.elements[0] -= s[0] * this.speed; this.at.elements[0] -= s[0] * this.speed;
        this.eye.elements[1] -= s[1] * this.speed; this.at.elements[1] -= s[1] * this.speed;
        this.eye.elements[2] -= s[2] * this.speed; this.at.elements[2] -= s[2] * this.speed;
    }

    // --- Rotation Logic ---

    panLeft(alpha = 1) {
        // 1. Get current forward vector
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];

        // 2. Create a rotation matrix
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
        // 3. Manually multiply Matrix4 * Vector (since multiplyVector3 is failing)
        let m = rotationMatrix.elements;
        let x = f[0], y = f[1], z = f[2];
        
        // Matrix multiplication math
        let nx = m[0] * x + m[4] * y + m[8]  * z;
        let ny = m[1] * x + m[5] * y + m[9]  * z;
        let nz = m[2] * x + m[6] * y + m[10] * z;

        // 4. Update the 'at' point
        this.at.elements[0] = this.eye.elements[0] + nx;
        this.at.elements[1] = this.eye.elements[1] + ny;
        this.at.elements[2] = this.eye.elements[2] + nz;
    }

    panUp(alpha = 1) {
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];

        // Calculate Side Vector (s = f x up)
        let s = [
            f[1] * this.up.elements[2] - f[2] * this.up.elements[1],
            f[2] * this.up.elements[0] - f[0] * this.up.elements[2],
            f[0] * this.up.elements[1] - f[1] * this.up.elements[0]
        ];
        let slen = Math.sqrt(s[0]*s[0] + s[1]*s[1] + s[2]*s[2]);
        s = [s[0]/slen, s[1]/slen, s[2]/slen];

        // Create rotation matrix around side vector
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, s[0], s[1], s[2]);
        
        let m = rotationMatrix.elements;
        let x = f[0], y = f[1], z = f[2];
        
        let nx = m[0] * x + m[4] * y + m[8]  * z;
        let ny = m[1] * x + m[5] * y + m[9]  * z;
        let nz = m[2] * x + m[6] * y + m[10] * z;

        this.at.elements[0] = this.eye.elements[0] + nx;
        this.at.elements[1] = this.eye.elements[1] + ny;
        this.at.elements[2] = this.eye.elements[2] + nz;
    }

    panRight(alpha = 1) {
        this.panLeft(-alpha);
    }


    // --- Math Helpers ---

    getForwardVector(normalized = true) {
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];
        if (normalized) {
            let len = Math.sqrt(f[0]*f[0] + f[1]*f[1] + f[2]*f[2]);
            return [f[0]/len, f[1]/len, f[2]/len];
        }
        return f;
    }

    getSideVector() {
        let f = this.getForwardVector(true);
        // Cross Product: s = up x f
        let s = [
            this.up.elements[1] * f[2] - this.up.elements[2] * f[1],
            this.up.elements[2] * f[0] - this.up.elements[0] * f[2],
            this.up.elements[0] * f[1] - this.up.elements[1] * f[0]
        ];
        let len = Math.sqrt(s[0]*s[0] + s[1]*s[1] + s[2]*s[2]);
        return [s[0]/len, s[1]/len, s[2]/len];
    }
}