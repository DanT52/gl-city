class Camera {

// camera has yaw pitch and roll angles
    constructor(pos, yaw, pitch, roll) {

        this.pos = pos; // Vec4

        this.yaw = yaw;   // xz rotation
        this.pitch = pitch; // yz rotation
        this.roll = roll; // xy rotation

    }


    // movement 
    move(strafe, vertical, forward) {
        
        let vector = new Vec4(strafe, vertical, forward, 0);

        // this needs to take into account current oreitation of cam
        let Y = Mat4.rotation_xz(this.yaw);
        let P = Mat4.rotation_yz(this.pitch);
        let R = Mat4.rotation_xy(this.roll)
        let orientation = Y.mul(P).mul(R);

        // transform the vector to the oreitation
        let world = orientation.transform_vec(vector);

        // update camera position
        this.pos = this.pos.add(world);
    }

    // rotations 

    // for yaw after a full rotation reset
    rotateYaw(angle) {
        this.yaw += angle;
        // normalize yaw to be within 0 to 1 (tao)
        if (this.yaw > 1) {
            this.yaw -= 1;
        } else if (this.yaw < 0) {
            this.yaw += 1;
        }
    }

    // should have a pitch limit under .25
    rotatePitch(angle) {
        this.pitch += angle;
        if (this.pitch > 0.25) {
            this.pitch = 0.25;
        } else if (this.pitch < -0.25) {
            this.pitch = -0.25;
        }
    }

    // for roll limit too -.5 / .5
    rotateRoll(angle) {
        this.roll += angle;
        if (this.roll > 0.5) {
            this.roll = 0.5;
        } else if (this.roll < -0.5) {
            this.roll = -0.5;
        }
    }


    // getting the veiw matrix 
    //T * Y * P * R
    // then after do matrix.inverse()
    // that is it
    
    getViewMatrix() {
        let T = Mat4.translation(this.pos.x, this.pos.y, this.pos.z);
        let Y = Mat4.rotation_xz(this.yaw);
        let P = Mat4.rotation_yz(this.pitch);
        let R = Mat4.rotation_xy(this.roll);

        // T * Y * P * R
        let viewMatrix = T.mul(Y).mul(P).mul(R);

        return viewMatrix.inverse();
    }


}