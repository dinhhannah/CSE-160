class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.viewMat = new Matrix4();
        this.projMat = new Matrix4();
        this.projMat.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
        this.updateView();
    }

    updateView() {
        this.viewMat.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    forward() {
        let f = new Vector3().set(this.at).sub(this.eye).normalize();
        this.at.add(f.mul(0.5));
        this.eye.add(f.mul(0.5));
        this.updateView();
    }

    back() {
        let f = new Vector3().set(this.at).sub(this.eye).normalize();
        this.at.sub(f.mul(0.5));
        this.eye.sub(f.mul(0.5));
        this.updateView();
    }

    left() {
        let f = new Vector3().set(this.at).sub(this.eye);
        let s = Vector3.cross(f, this.up).normalize();
        this.at.add(s.mul(0.25));
        this.eye.add(s.mul(0.25));
        this.updateView();
    }

    right() {
        let f = new Vector3().set(this.at).sub(this.eye);
        let s = Vector3.cross(f, this.up).normalize();
        this.at.sub(s.mul(0.25));
        this.eye.sub(s.mul(0.25));
        this.updateView();
    }

    panLeft(deg = 5) {
        let f = new Vector3().set(this.at).sub(this.eye);
        let rotationMatrix = new Matrix4().setRotate(deg, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at = new Vector3().set(this.eye).add(f_prime);
        this.updateView();
    }

    panRight(deg = 5) {
        this.panLeft(-deg);
    }

    panUp(deg = 5) {
        let f = new Vector3().set(this.at).sub(this.eye);
        let s = Vector3.cross(f, this.up).normalize();
        let rotationMatrix = new Matrix4().setRotate(deg, s.elements[0], s.elements[1], s.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at = new Vector3().set(this.eye).add(f_prime);
        this.updateView();
    }

    panDown(deg = 5) {
        this.panUp(-deg);
    }
}