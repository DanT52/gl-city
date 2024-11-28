// index.js
let canvas = document.getElementById('glcanvas');
let gl = canvas.getContext('webgl2');

// i do the lighting stuff in the vertex source
let vertex_source = 
`#version 300 es
precision mediump float;

// set uniforms
uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform vec3 cam_pos;

//mat info
uniform float mat_ambient;
uniform float mat_diffuse;
uniform float mat_specular;
uniform float mat_shininess;

//directional light
uniform vec3 sun_dir;
uniform vec3 sun_color;


//point light
uniform vec3 point_light_pos;
uniform vec3 point_light_color;

// attenuation constant
uniform float L;


//ins and outs
in vec3 coordinates;
in vec4 color;
in vec2 uv;
in vec3 normal;

out vec4 v_color;
out vec2 v_uv;

vec3 spec_color( 
    vec3 normal, 
    vec3 light_dir,
    vec3 eye_dir, 
    vec3 light_color, 
    float mat_specular,
    float mat_shiniess
) {
    float cos_light_surf_normal = dot( normal, light_dir );

    if( cos_light_surf_normal <= 0.0 ) {
        return vec3( 0.0, 0.0, 0.0 );
    }

    vec3 light_reflection = 
        2.0 * cos_light_surf_normal * normal - light_dir;

    return 
        pow( 
            max( dot( light_reflection, normalize( eye_dir ) ), 0.0  ),
            mat_shininess 
        ) * light_color * mat_specular;
}

void main(void) {
    gl_Position = projection * view * model * vec4(coordinates, 1.0);
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

    // if i wanna do it with the function
    // vec3 spec = spec_color(normal_tx, light_dir, view_dir, sun_color, mat_specular, mat_shininess );
    // vec4 specular_color = vec4(spec, 1.0);

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


    v_color = (0.0 * color )+( ambient_color + diffuse_color + specular_color + point_light_color );
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

let initialCamPosition = new Vec4(0, 0, -4, 0);
let cam = new Camera(initialCamPosition, 0, 0, 0, );

// Create LitMaterial instance
let material = new LitMaterial(gl, 'texture/metal_scale.png', gl.LINEAR, 0.25, 1.0, 2.0, 4.0);
let material2 = new LitMaterial(gl, 'texture/concrete.png', gl.LINEAR, 0.25, .5, 0, .2 );

// Set material properties
const mat_ambient = 0.25;
const mat_diffuse = 1.0;
const mat_specular = 2.0;
const mat_shininess = 4.0;

// Set light properties
const sun_dir = [1.0, 1, 0];
const sun_color = [1.0, 1.0, 1.0];

// set point light properties
const point_light_pos = [-1.0, -1.0, -1.0];
const point_light_color = [1.0, 0.0, 0.0]; // red tint


// constant for the attenuation
const L = 1.5;


set_uniform_vec3(gl, shaderProgram, 'sun_dir', sun_dir);
set_uniform_vec3(gl, shaderProgram, 'sun_color', sun_color);
set_uniform_vec3(gl, shaderProgram, 'cam_pos', [0,0,-4]);

// Set point light uniforms
set_uniform_vec3(gl, shaderProgram, 'point_light_pos', point_light_pos);
set_uniform_vec3(gl, shaderProgram, 'point_light_color', point_light_color);

set_uniform_scalar(gl, shaderProgram, 'L', L);


// create the sphere using NormalMesh
let sphere = NormalMesh.uv_sphere(gl, shaderProgram, 1, 16, material);
let plane = NormalMesh.platform( gl, shaderProgram, 20, 20, 1, 4, material2 );
console.log(plane)
let cow = null;
let cowNode = new Node()
cowNode.position = new Vec4(20, 50, -100, 1)

NormalMesh.from_obj_file(gl, 'OBJs/cow.obj', shaderProgram, material2, (loadedMesh) => {
    cow = loadedMesh;
    cowNode.data = cow
    console.log(cow)
});

let scene = new Node(plane);
scene.position = new Vec4(0, 0, 0, 1);
let sphereNode = scene.addChild(sphere)
sphereNode.position = new Vec4(0, 1, -1, 1);

// scene.children.push(cowNode)



// rendering loop
function render(currentTime) {
    previousTime = currentTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // combine transformations to form the model and view matrices
    let model = Mat4.identity();
    let view = cam.getViewMatrix();

    // set the model and view matrix uniforms
    set_uniform_matrix4(gl, shaderProgram, 'model', model.data);
    set_uniform_matrix4(gl, shaderProgram, 'view', view.data);
    set_uniform_matrix4(gl, shaderProgram, 'projection', projection.data);

    // update the camera position each time
    set_uniform_vec3(gl, shaderProgram, 'cam_pos', [cam.pos.x, cam.pos.y, cam.pos.z]);


    // plane.render( gl );
    // sphere.render( gl );
    // if (cow) {
    //     cow.render(gl);
    // }
    scene.render(gl, shaderProgram);

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
    cam.pos = initialCamPosition;
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

