class Circle {
    constructor() {
        this.type = "circle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
    
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // Draw
        var d = this.size/200.0; //delta

        // Build an array of ALL vertices for this circle
        // first point is center [x, y]
        let allVertices = [xy[0], xy[1]];

        let angle_step = 360.0/this.segments;
        for(var angle = 0; angle <= 360; angle+=angle_step) {
            // let centerPT = [xy[0], xy[1]];
            // let angle1 = angle;
            // let angle2 = angle + angle_step;

            // let vec1 = [d * Math.cos(angle1*Math.PI/180)/2, d * Math.sin(angle1*Math.PI/180)/2];
            // let vec2 = [d * Math.cos(angle2*Math.PI/180)/2, d * Math.sin(angle2*Math.PI/180)/2];
            
            // let pt1 = [centerPT[0] + vec1[0], centerPT[1] + vec1[1]];
            // let pt2 = [centerPT[0] + vec2[0], centerPT[1] + vec2[1]];

            let angle_rad = angle * Math.PI / 180;
            let x = xy[0] + (Math.cos(angle_rad) * d) / 2;
            let y = xy[1] + (Math.sin(angle_rad) * d) / 2;
            
            allVertices.push(x, y);
            // drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
        }

        //1 draw call per circle instead of per segment
        drawTriangleFan(allVertices);
    }
}