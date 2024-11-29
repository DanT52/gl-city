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

    generateLightsLists(parentMatrix, dirLights, pointLights) {
        const matrix = parentMatrix.mul(this.getMatrix());
        const {x, y, z} = matrix.transformPoint()
        if (this instanceof DirectionalLightNode) {
            dirLights.push({
                direction:[x,y,z],
                color: this.light.color
            });
        } else if (this instanceof PointLightNode) {
            pointLights.push({
                position: [x,y,z],
                color: this.light.color,
                attenuation: this.light.attenuation
            });
        }
        for (const child of this.children) {
            child.generateLightsLists(matrix, dirLights, pointLights);
        }
    }

    updateLightUniforms(gl, program, dirLights, pointLights) {
        gl.uniform1i(gl.getUniformLocation(program, "num_dir_lights"), dirLights.length);
        dirLights.forEach((light, index) => {
            set_uniform_vec3(gl, program, `dir_lights[${index}].direction`, light.direction);
            set_uniform_vec3(gl, program, `dir_lights[${index}].color`, light.color);
        });
    
        gl.uniform1i(gl.getUniformLocation(program, "num_point_lights"), pointLights.length);
        pointLights.forEach((light, index) => {
            set_uniform_vec3(gl, program, `point_lights[${index}].position`, light.position);
            set_uniform_vec3(gl, program, `point_lights[${index}].color`, light.color);
            set_uniform_scalar(gl, program, `point_lights[${index}].attenuation`, light.attenuation);
        });
    }    

    render(gl, shaderProgram) {
        gl.useProgram(shaderProgram);
        
        let dirLights = [];
        let pointLights = [];
        const jobs = [];

        this.generateRenderJobs(new Mat4(), jobs);
        this.generateLightsLists(new Mat4(), dirLights, pointLights);
        this.updateLightUniforms(gl, shaderProgram, dirLights, pointLights);

        for (const job of jobs) {
            set_uniform_matrix4(gl, shaderProgram, 'model', job.matrix.data);
            job.mesh.render(gl);
        }
    }
}


class PointLightNode extends Node {
    constructor(color, attenuation, data = null) {
        super(data);
        this.light = {  color, attenuation };
    }


}

class DirectionalLightNode extends Node {
    constructor(color, data = null) {
        super(data);
        this.light = {  color };
    }


}

class RenderMesh {
    constructor(matrix, mesh) {
        this.matrix = matrix;
        this.mesh = mesh;
    }
}