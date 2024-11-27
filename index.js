// index.js
let canvas = document.getElementById('glcanvas');
let gl = canvas.getContext('webgl2');

// i do the lighting stuff in the vertex source
let vertex_source = 
`#version 300 es
precision mediump float;

// set uniforms
uniform mat4 model;
uniform mat4 view;

//mat info
uniform float mat_ambient;
uniform float mat_diffuse;
uniform float mat_specular;
uniform float mat_shininess;

//directional light
uniform vec3 sun_dir;
uniform vec3 sun_color;
uniform vec3 cam_pos;

//point light
uniform vec3 point_light_pos;
uniform vec3 point_light_color;

// attenuation constant
uniform float L;


//ins and outs
in vec3 coordinates;
in vec2 uv;
in vec3 normal;

out vec4 v_color;
out vec2 v_uv;


void main(void) {
    gl_Position = view * model * vec4(coordinates, 1.0);
    v_uv = uv;

    vec3 light_dir = normalize(sun_dir);
    vec3 coords_tx = (model * vec4(coordinates, 1.0)).xyz;
    vec3 view_dir = normalize(cam_pos - coords_tx);
    vec3 normal_tx = normalize(mat3(model) * normal);

    //directional light calculations

    // Ambient
    vec4 ambient_color = vec4(mat_ambient, mat_ambient, mat_ambient, 1.0);

    // Diffuse
    float diff = max(dot(normal_tx, light_dir), 0.0);
    vec4 diffuse_color = vec4(mat_diffuse * sun_color * diff, 1.0);

    // Specular
    vec3 R = 2.0 * dot(light_dir, normal_tx) * normal_tx - light_dir;
    float spec = pow(max(dot(view_dir, R), 0.0), mat_shininess);
    vec4 specular_color = vec4(mat_specular * sun_color * spec, 1.0);



    // Point light calculations
    vec3 point_light_dir = normalize(point_light_pos - coords_tx);
    float point_diff = max(dot(normal_tx, point_light_dir), 0.0);
    vec4 point_diffuse_color = vec4(mat_diffuse * point_light_color * point_diff, 1.0);

    vec3 point_R = 2.0 * dot(point_light_dir, normal_tx) * normal_tx - point_light_dir;
    float point_spec = pow(max(dot(view_dir, point_R), 0.0), mat_shininess);
    vec4 point_specular_color = vec4(mat_specular * point_light_color * point_spec, 1.0);


    // having these here does seem to make the ligthing look better when
    // looking from the opposite side of the sphere. 
    float NdotL = dot(light_dir, normal_tx);
    if (NdotL <= 0.0) {
        specular_color = vec4(0.0);
    }
    float point_NdotL = dot(point_light_dir, normal_tx);
    if (point_NdotL <= 0.0) {
        point_specular_color = vec4(0.0);
    }

    // calculate attenuation for point light
    float d = length(point_light_pos - coords_tx);
    float attenuation = 1.0 / (L * d);
    vec4 point_light_color = (point_diffuse_color + point_specular_color) * attenuation;


    v_color = ambient_color + diffuse_color + specular_color + point_light_color;
}`;


let fragment_source = 
`#version 300 es
precision mediump float;

in vec4 v_color;
in vec2 v_uv;

uniform sampler2D tex_0;

out vec4 f_color;

void main(void) {
    vec4 tex_color = texture(tex_0, v_uv);
    f_color = tex_color * v_color;
}`;

// compile create program
let shaderProgram = create_compile_and_link_program(gl, vertex_source, fragment_source);
set_render_params( gl );
gl.useProgram(shaderProgram);

// my clear color
gl.clearColor(0.3, 0.55, 0.6, 1.0);

// create xor texture
function xor_texture() {
    let width = 256;
    let data = new Array(width * width * 4); // 4 because there are 4 bytes per pixel: R, G, B, and A

    for (let row = 0; row < width; row++) {
        for (let col = 0; col < width; col++) {
            let pix = (row * width + col) * 4;
            let brightness = row ^ col;
            data[pix] = data[pix + 1] = data[pix + 2] = brightness;
            data[pix + 3] = 255; // alpha always max (fully opaque)
        }
    }

    return new Uint8Array(data);
}

// create and bind the texture
let tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);

// load xor texture
gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    256, 256, 0,
    gl.RGBA, gl.UNSIGNED_BYTE,
    xor_texture()
);

// parameters
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);



// create image object
let image = new Image();

function on_load() {
    
    // bind
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // load the image pixels into the texture
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE,
        image
    );

    // generate mipmaps
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

}

// set the callback
image.onload = on_load;

// start loading the image
image.src = '../texture/metal_scale.png';


// calculate FOV stuff function
function perspective(fovX, near, far) {
    // get aspect ratio from canvas
    const aspectRatio = canvas.width / canvas.height;

    // convert field of view from turns to radians
    const fovX_rads = 2 * Math.PI * fovX;

    // convert fovX to fovY using (multily fovY by reciprical of aspect ratio to turn it into fovX)
    const fovY_rads = fovX_rads / aspectRatio;
    //const fovY_rads = fovX_rads

    // calculate planes
    let topfPlane = Math.tan(fovY_rads / 2) * near;
    let bottomPlane = -topfPlane;
    let rightPlane = topfPlane * aspectRatio;
    let leftPlane = -rightPlane;

    // return the frustum projection matrix using the calculated planes
    return Mat4.frustum(leftPlane, rightPlane, bottomPlane, topfPlane, near, far);
}



// get the frustum projection thing
let projection = perspective(0.25,.20, 100);

let angle = 0;
let previousTime = 0;
let DESIRED_TICK_RATE = 60;
let DESIRED_MSPT = 1000 / 60;
let MOVE_SPEED = 5;
let ROTATE_SPEED = .125;

let MOVE_PER_FRAME = MOVE_SPEED / DESIRED_TICK_RATE;
let ROTATE_PER_FRAME = ROTATE_SPEED / DESIRED_TICK_RATE;

let keys = Keys.start_listening();

let initialCamPosition = new Vec4(0, 0, -1.5, 0);
let cam = new Camera(initialCamPosition, 0, 0, 0, );


// bind texture sampler
const sampler_loc = gl.getUniformLocation(shaderProgram, 'tex_0');
gl.uniform1i(sampler_loc, 0);

// Set material properties
const mat_ambient = 0.25;
const mat_diffuse = 1.0;
const mat_specular = 2.0;
const mat_shininess = 4.0;

// Set light properties
const sun_dir = [1.0, 1.0, 1.0];
const sun_color = [1.0, 1.0, 1.0];

// set point light properties
const point_light_pos = [-1.0, -1.0, -1.0];
const point_light_color = [1.0, 0.0, 0.0]; // red tint


// constant for the attenuation
const L = 1.5;


// Set uniforms
set_uniform_scalar(gl, shaderProgram, 'mat_ambient', mat_ambient);
set_uniform_scalar(gl, shaderProgram, 'mat_diffuse', mat_diffuse);
set_uniform_scalar(gl, shaderProgram, 'mat_specular', mat_specular);
set_uniform_scalar(gl, shaderProgram, 'mat_shininess', mat_shininess);
set_uniform_vec3(gl, shaderProgram, 'sun_dir', sun_dir);
set_uniform_vec3(gl, shaderProgram, 'sun_color', sun_color);
set_uniform_vec3(gl, shaderProgram, 'cam_pos', [0,0,-1.5]);

// Set point light uniforms
set_uniform_vec3(gl, shaderProgram, 'point_light_pos', point_light_pos);
set_uniform_vec3(gl, shaderProgram, 'point_light_color', point_light_color);

set_uniform_scalar(gl, shaderProgram, 'L', L);


function make_uv_sphere(gl, program, subdivs, material) {
    let verts = [];
    let indis = [];
    const TAU = 2 * Math.PI;

    for (let layer = 0; layer <= subdivs; layer++) {

        let y_turns = layer / subdivs / 2;
        let y = Math.cos(y_turns * TAU) / 2

        for (let subdiv = 0; subdiv <= subdivs; subdiv++) {

            let turns = subdiv / subdivs
            let rads = turns * TAU

            let radius_scale = Math.sin(2 * Math.PI * y_turns)
            let x = Math.cos( rads ) / 2 * radius_scale;
            let z = Math.sin(rads) / 2 * radius_scale;
            let normal = new Vec4(x, y, z, 0).norm();

            verts.push(x, y, z);                       //pos
            verts.push(1, 1, 1, 1);                    // color
            verts.push(turns, y_turns * 2);            //UVs
            verts.push(normal.x, normal.y, normal.z); // normals

            // push indis
            let first = (layer * (subdivs + 1)) + subdiv;
            let second = first + subdivs + 1;
            indis.push(first, second, first + 1);
            indis.push(second, second + 1, first + 1);
        }
    }

    // vert andindex buff
    let vertBuff = create_and_load_vertex_buffer(gl, verts, gl.STATIC_DRAW);
    let indexBuff = create_and_load_elements_buffer(gl, indis, gl.STATIC_DRAW);
    return { vertBuff, indexBuff, numIndices: indis.length };
}


// create the sphere
let sphere = make_uv_sphere(gl, shaderProgram, 16);

function render_sphere(gl) {
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.useProgram(shaderProgram);

    // bind and set buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.vertBuff);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indexBuff);

    let stride = 48; // each vertex has 12 floats (3+4+2+3), each float is 4 bytes

    // use set_vertex_attrib_to_buffer function
    set_vertex_attrib_to_buffer(gl, shaderProgram, "coordinates", sphere.vertBuff, 3, gl.FLOAT, false, stride, 0);
    // we dont use color this time
    //set_vertex_attrib_to_buffer(gl, shaderProgram, "color", sphere.vertBuff, 4, gl.FLOAT, false, stride, 12);
    set_vertex_attrib_to_buffer(gl, shaderProgram, "uv", sphere.vertBuff, 2, gl.FLOAT, false, stride, 28);
    set_vertex_attrib_to_buffer(gl, shaderProgram, "normal", sphere.vertBuff, 3, gl.FLOAT, false, stride, 36);

    
    // Bind the texture
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawElements(gl.TRIANGLES, sphere.numIndices, gl.UNSIGNED_SHORT, 0);
}

// rendering loop
function render(currentTime) {
    previousTime = currentTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // combine transformations to form the model and view matrices
    let model = Mat4.identity();
    let view = projection.mul(cam.getViewMatrix());

    // set the model and view matrix uniforms
    set_uniform_matrix4(gl, shaderProgram, 'model', model.data);
    set_uniform_matrix4(gl, shaderProgram, 'view', view.data);

    // update the camera position each time
    set_uniform_vec3(gl, shaderProgram, 'cam_pos', [cam.pos.x, cam.pos.y, cam.pos.z]);

    render_sphere(gl);
    updateCameraInfo();

    // next frame
    requestAnimationFrame(render);
}

//object to map actions to camera movement
const keyActions = {
    'ArrowLeft': () => cam.rotateYaw(-ROTATE_PER_FRAME),
    'ArrowRight': () => cam.rotateYaw(ROTATE_PER_FRAME),
    'ArrowUp': () => cam.rotatePitch(-ROTATE_PER_FRAME),
    'ArrowDown': () => cam.rotatePitch(ROTATE_PER_FRAME),
    'KeyQ': () => cam.rotateRoll(-ROTATE_PER_FRAME),
    'KeyE': () => cam.rotateRoll(ROTATE_PER_FRAME),
    'Space': () => cam.move(0, MOVE_PER_FRAME, 0),
    'KeyC': () => cam.move(0, -MOVE_PER_FRAME, 0),
    'KeyD': () => cam.move(MOVE_PER_FRAME, 0, 0),
    'KeyA': () => cam.move(-MOVE_PER_FRAME, 0, 0),
    'KeyW': () => cam.move(0, 0, MOVE_PER_FRAME),
    'KeyS': () => cam.move(0, 0, -MOVE_PER_FRAME),
};

function update() {
    // Rotating scene objects, moving the camera, etc.
    // All these go in me

    Object.keys(keyActions).forEach(key => {
        if (keys.is_key_down(key)) { // see if any of the keys are down
            keyActions[key](); // do their respective action if so
        }
    });
}



// mouse controls
let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
let sensitivity = 1; // default sensitivity

// adding these to document so there is more room for mouse to move
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // left mouse button
        isMouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

document.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
        isMouseDown = false;
    }
});

document.addEventListener('mousemove', (event) => {
    if (isMouseDown){
        // calculate the deltas
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        cam.rotateYaw(deltaX * sensitivity / 1000);
        cam.rotatePitch(-deltaY * sensitivity / 1000);

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

    }
    
    
});

// reset the camera to initial state
document.getElementById('reset-camera').addEventListener('click', () => {
    cam.pos = new Vec4(0, 0, -1.5, 0);
    cam.yaw = 0;
    cam.pitch = 0;
    cam.roll = 0;
    updateCameraInfo();
});

// update the sensitivity
document.getElementById('sensitivity').addEventListener('input', (event) => {
    sensitivity = parseFloat(event.target.value);
});

// i wanted to see the current camera stats
function updateCameraInfo() {
    document.getElementById('camera-position').textContent = `(${cam.pos.x.toFixed(2)}, ${cam.pos.y.toFixed(2)}, ${cam.pos.z.toFixed(2)})`;
    document.getElementById('camera-yaw').textContent = cam.yaw.toFixed(2);
    document.getElementById('camera-pitch').textContent = cam.pitch.toFixed(2);
    document.getElementById('camera-roll').textContent = cam.roll.toFixed(2);
}

// start animation
requestAnimationFrame(render);
setInterval( update, DESIRED_MSPT ); // set up the function for updating camera position

function set_uniform_scalar(gl, program, name, value) {
    const location = gl.getUniformLocation(program, name);
    gl.uniform1f(location, value);
}

function set_uniform_vec3(gl, program, name, value) {
    const location = gl.getUniformLocation(program, name);
    gl.uniform3fv(location, value);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    projection = perspective(0.25, 0.20, 100); // recalculate projection matrix
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // initial call to set the canvas size

