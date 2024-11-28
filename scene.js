class Node {
    constructor(data = null) {
        this.position = new Vec4(0, 0, 0, 1);
        this.scale = new Vec4(1, 1, 1, 1);
        this.roll = 0;
        this.pitch = 0;
        this.yaw = 0;
        this.data = data;
        this.children = [];
    }

    addChild(data = null) {
        const child = new Node(data);
        this.children.push(child);
        return child;
    }

    getMatrix() {
        let matrix = new Mat4();
        
        matrix = matrix.mul(Mat4.translation(this.position.x, this.position.y, this.position.z ));
        matrix = matrix.mul(Mat4.rotation_xz(this.yaw));
        matrix = matrix.mul(Mat4.rotation_yz(this.pitch));
        matrix = matrix.mul(Mat4.rotation_xy(this.roll));
        matrix = matrix.mul(Mat4.scale(this.scale.x, this.scale.y, this.scale.z));
        
        return matrix;
    }

    generateRenderJobs(parentMatrix, jobs) {
        const matrix = parentMatrix.mul(this.getMatrix());
        if (this.data) {
            jobs.push(new RenderMesh(matrix, this.data));
        }
        for (const child of this.children) {
            child.generateRenderJobs(matrix, jobs);
        }
    }

    render(gl, shaderProgram) {
        const jobs = [];
        this.generateRenderJobs(new Mat4(), jobs);
        for (const job of jobs) {
            
            set_uniform_matrix4(gl, shaderProgram, 'model', job.matrix.data);
            job.mesh.render(gl);
        }
    }
}

class RenderMesh {
    constructor(matrix, mesh) {
        this.matrix = matrix;
        this.mesh = mesh;
    }
}