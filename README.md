# GL-City

GL-City is a 3D WebGL-based interactive scene featuring a procedurally generated city, animated elements such as a car, a helicopter, and a wind turbine, as well as lighting effects including a dynamic moon and galaxy light. The project demonstrates advanced WebGL techniques for rendering, animations, and scene management.

![GL-City](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWxzaWUwOTJjNzE3YjZtdGQ4Ym9sOTNiYzQ3bmE3MXJldm12am94ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RelclhCPdaxvaB8vYw/giphy.gif)


## Features

- **Procedurally Generated City**: Buildings are created dynamically based on specified dimensions and height ranges.
- **Animated Objects**:
  - **Car**: Follows a square path with smooth transitions and spinning wheels.
  - **Helicopter**: Rotating propellers and dynamic positioning.
  - **Wind Turbine**: Rotating blades.
- **Dynamic Lighting**:
  - A directional moonlight source with a rolling moon.
  - A galaxy background light.
  - Headlights on the car.
- **Interactive Camera Controls**: Navigate the scene using the keyboard and mouse.
- **Help Overlay**: Provides instructions for controls, adjustable mouse sensitivity, and a "Don't show again" option.

## Controls

### Keyboard
- **W/A/S/D**: Move forward/left/backward/right.
- **Arrow Keys**: Rotate the camera.
- **Space**: Move the camera up.
- **C**: Move the camera down.
- **Q/E**: Rotate the camera roll counterclockwise/clockwise.

### Mouse
- Move the mouse to look around.
- Hold the left mouse button to adjust the camera.

## Project Structure

- **`scene.js`**: Manages the 3D scene, objects, and animations.
- **`node.js`**: Implements the node-based hierarchical structure for scene management.
- **`normal_mesh.js`**: Handles geometry generation and loading OBJ files.
- **`lit_material.js`**: Manages material properties and textures for lighting effects.
- **`camera.js`**: Handles camera transformations and user input.
- **`index.html`**: Entry point for the web application.
- **`lib.js`**, **`matrix.js`**, **`vector.js`**, **`keys.js`**, **`cubemap.js`**: Utility libraries for matrix operations, vector math, key bindings, and environment mapping.
