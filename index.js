

let canvas = document.getElementById('glcanvas');
let gl = canvas.getContext('webgl2');

const MAX_DIR_LIGHTS = 4;
const MAX_POINT_LIGHTS = 8;

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

// Directional lights
#define MAX_DIR_LIGHTS 4
struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight dir_lights[MAX_DIR_LIGHTS];
uniform int num_dir_lights;

// Point lights
#define MAX_POINT_LIGHTS 8
struct PointLight {
    vec3 position;
    vec3 color;
    float attenuation;
};
uniform PointLight point_lights[MAX_POINT_LIGHTS];
uniform int num_point_lights;

// ins and outs
in vec3 coordinates;
in vec4 color;
in vec2 uv;
in vec3 normal;

out vec4 v_color;
out vec2 v_uv;

vec4 calculateAmbient(float mat_ambient) {
    return vec4(mat_ambient, mat_ambient, mat_ambient, 1.0);
}

vec4 calculateDiffuse(vec3 normal, vec3 light_dir, vec3 light_color, float mat_diffuse) {
    float diff = max(dot(normal, light_dir), 0.0);
    return vec4(mat_diffuse * light_color * diff, 1.0);
}

vec4 calculateSpecular(vec3 normal, vec3 light_dir, vec3 view_dir, vec3 light_color, float mat_specular, float mat_shininess) {
    

    vec3 R = 2.0 * dot(light_dir, normal) * normal - light_dir;
    float spec = pow(max(dot(view_dir, R), 0.0), mat_shininess);

    float NdotL = dot(light_dir, normal);
    if (NdotL <= 0.0) {
        spec = 0.0;
    }

    return vec4(mat_specular * light_color * spec, 1.0);
}

vec4 calculatePointLight(vec3 coords_tx, vec3 normal, vec3 view_dir, PointLight light, float mat_diffuse, float mat_specular, float mat_shininess) {
    vec3 point_light_dir = normalize(light.position - coords_tx);
    float point_diff = max(dot(normal, point_light_dir), 0.0);
    vec4 point_diffuse_color = calculateDiffuse(normal, point_light_dir, light.color, mat_diffuse);

    vec4 point_specular_color = calculateSpecular(normal, point_light_dir, view_dir, light.color, mat_specular, mat_shininess);

    float d = length(light.position - coords_tx);
    float attenuation = 1.0 / (light.attenuation * d);

    return (point_diffuse_color + point_specular_color) * attenuation;
}

void main(void) {
    gl_Position = projection * view * model * vec4(coordinates, 1.0);
    v_uv = uv;

    vec3 coords_tx = (model * vec4(coordinates, 1.0)).xyz;
    vec3 view_dir = normalize(cam_pos - coords_tx);
    vec3 normal_tx = normalize(mat3(model) * normal);

    // Ambient
    vec4 ambient_color = calculateAmbient(mat_ambient);

    // Directional light calculations
    vec4 dir_light_color = vec4(0.0);
    for (int i = 0; i < num_dir_lights; i++) {
        vec3 light_dir = normalize(dir_lights[i].direction);
        dir_light_color += calculateDiffuse(normal_tx, light_dir, dir_lights[i].color, mat_diffuse) +
                           calculateSpecular(normal_tx, light_dir, view_dir, dir_lights[i].color, mat_specular, mat_shininess);
    }

    // Point light calculations
    vec4 point_light_color = vec4(0.0);
    for (int i = 0; i < num_point_lights; i++) {
        point_light_color += calculatePointLight(coords_tx, normal_tx, view_dir, point_lights[i], mat_diffuse, mat_specular, mat_shininess);
    }

    // Combine all lighting
    v_color = (color * 0.0) + ambient_color + dir_light_color + point_light_color;
}
`;

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
gl.clearColor(0.1, 0.2, 0.3, 1.0);

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
let MOVE_SPEED = 10;
let ROTATE_SPEED = .2;

let MOVE_PER_FRAME = MOVE_SPEED / DESIRED_TICK_RATE;
let ROTATE_PER_FRAME = ROTATE_SPEED / DESIRED_TICK_RATE;

let keys = Keys.start_listening();

let initialCamPosition = new Vec4(0, 5, -10, 0);
let cam = new Camera(initialCamPosition, 0, 0, 0, );

// Set material properties
const mat_ambient = 0.25;
const mat_diffuse = 1.0;
const mat_specular = 2.0;
const mat_shininess = 4.0;


// create the scene
let scene = new Scene(gl, shaderProgram);

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

    scene.render(currentTime);

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

