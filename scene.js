class Scene {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;

        // Create LitMaterial instances
        this.metal = new LitMaterial(gl, 'texture/metal.png', gl.LINEAR, 0.25, 0.5, 1.0, 2.0);
        this.city = new LitMaterial(gl, 'texture/city.png', gl.LINEAR, 0.5, 0.5, 2.5, 2);
        this.ground = new LitMaterial(gl, 'texture/concrete.png', gl.LINEAR, 0.2, 0.5, 0.1, 0.1);
        
        this.BlackMetal = new LitMaterial(gl, 'texture/blackMetal.png', gl.LINEAR, 0.5, 0.5, 2, 2);
        this.moon = new LitMaterial(gl, 'texture/moon.png', gl.LINEAR, 1, 0.1, 0.1, 0.1);


        // Create base elements
        let plane = NormalMesh.platform(gl, shaderProgram, 15, 15, 1, 4, this.ground);
        this.scene = new Node(null);
        this.plane = this.scene.addChild(plane)
        this.plane.yaw = .125
        this.sunbind = this.scene.addChild(null)
        this.turbine = null
        this.heliAnchor = null
        this.topProp = null
        this.backProp = null
        this.car = null
        this.frontWheels = null
        this.backWheels = null

        this.mainScene()
        
    }



    mainScene() {

        const cityNode = this.createCity(
            gl,
            shaderProgram,
            12, // Width of the city
            12, // Depth of the city
            5,  // Number of rows
            5,  // Number of columns
            3,  // Minimum building height
            6,  // Maximum building height
            this.city // Material for buildings
        );
        cityNode.position = new Vec4(0, 0, 0, 1);
        this.plane.children.push(cityNode);

        // moon
        let sphere = NormalMesh.uv_sphere(gl, shaderProgram, 1, 16, this.moon);
        const sphereNode = this.sunbind.addChild(sphere)
        sphereNode.position  = new Vec4(0, 25, 1, 1)
        sphereNode.roll = 0.225
        let sun = new DirectionalLightNode( [0.3, 0.4, 0.4])
        sphereNode.children.push(sun);
        this.sunbind.yaw = .5
        this.sunbind.pitch = .15
        this.sunbind.position.y = 9


        // galaxy perma light
        let galaxyLightNode = new DirectionalLightNode( [0.58, 0.54, 0.6])
        galaxyLightNode.position = new Vec4(1, 10, -30)
        this.scene.children.push(galaxyLightNode)

        // add in turbine
        const { baseNode, turbineNode } = this.addTurbine();
        this.turbine = turbineNode
        this.plane.children.push(baseNode);

        // add in helicopter
        let heliAnchor = new Node()
        this.heliAnchor = heliAnchor;
        let helibase = this.addHelicopter()
        helibase.position = new Vec4(6,7,0,0)
        helibase.scale = new Vec4(.2,.2,.2,0)
        helibase.roll = -.03
        helibase.pitch = -.04
        helibase.yaw = -.03
        heliAnchor.children.push(helibase);
        this.scene.children.push(heliAnchor)


        // add in the car

        let carNode = this.addCar()

        carNode.scale = new Vec4(.1, .1, .1, 0)
        carNode.position = new Vec4(4.5, 0, -4.5, 0)
        
    }

    addCar() {
        let carNode = new Node();
        let frontWheels = new Node();
        let backWheels = new Node();
        this.car = carNode
        this.frontWheels = frontWheels
        this.backWheels = backWheels

        NormalMesh.from_obj_file(gl, 'OBJs/car/carBody.obj', shaderProgram, this.BlackMetal, (loadedMesh) => {
            carNode.data = loadedMesh
        });
        NormalMesh.from_obj_file(gl, 'OBJs/car/wheels.obj', shaderProgram, this.metal, (loadedMesh) => {
            frontWheels.data = loadedMesh
            backWheels.data = loadedMesh
        });

        let pointLight = new PointLightNode( [0.4, 0.4, 1.0], 2)
        let pointLight2 = new PointLightNode( [0.4, 0.4, 1.0], 2)

        pointLight.position = new Vec4(1.8, 1.65, 6.73, 0)
        pointLight2.position = new Vec4(-1.8, 1.65, 6.73, 0)
        backWheels.position = new Vec4(1.85, 0.7, -2.7, 0)
        backWheels.scale = new Vec4(.95, 0.95, 0.95, 0)

        frontWheels.position = new Vec4(1.85, 0.7, 2.9, 0)
        frontWheels.scale = new Vec4(.95, 0.95, 0.95, 0)

        carNode.children.push(frontWheels)
        carNode.children.push(backWheels)
        carNode.children.push(pointLight)
        carNode.children.push(pointLight2)
        this.plane.children.push(carNode)

        return carNode
    }

    addHelicopter() {
        let helibody = new Node();
        let topProp = new Node();
        let backProp = new Node();

        // for aimation
        this.topProp = topProp;
        this.backProp = backProp;

        //load meshes
        NormalMesh.from_obj_file(gl, 'OBJs/helicopter/helibody.obj', shaderProgram, this.metal, (loadedMesh) => {
            helibody.data = loadedMesh
        });
        NormalMesh.from_obj_file(gl, 'OBJs/helicopter/top_prop.obj', shaderProgram, this.BlackMetal, (loadedMesh) => {
            topProp.data = loadedMesh
        });
        NormalMesh.from_obj_file(gl, 'OBJs/helicopter/back_prop.obj', shaderProgram, this.BlackMetal, (loadedMesh) => {
            backProp.data = loadedMesh
        });
        let sphere = NormalMesh.uv_sphere(gl, shaderProgram, 1, 16, this.moon);
        let pointLight = new PointLightNode( [0.87, 0.81, 0.65], .3)


        
        const sphereNode = helibody.addChild(sphere)
        helibody.children.push(topProp)
        helibody.children.push(backProp)
        sphereNode.children.push(pointLight);

        // positioning
        sphereNode.scale = new Vec4(.5,.5,.5,0)
        sphereNode.position = new Vec4(0,1.8,4,0)
        topProp.position = new Vec4(0,5.8,-.75,0)
        backProp.position = new Vec4(0.55,3.45,-11.9,0)

        return helibody;
    }

    addTurbine() {

        let baseNode = new Node()
        baseNode.scale = new Vec4(.5, .5, .5, .5);


        NormalMesh.from_obj_file(gl, 'OBJs/turbine/base.obj', shaderProgram, this.metal, (loadedMesh) => {
            baseNode.data = loadedMesh;
        });

        let turbineNode = new Node()
        NormalMesh.from_obj_file(gl, 'OBJs/turbine/turbine.obj', shaderProgram, this.BlackMetal, (loadedMesh) => {
            turbineNode.data = loadedMesh;
        });
        
        turbineNode.position = new Vec4(0, 26, .9, 1)
        turbineNode.roll = .2


        baseNode.children.push(turbineNode)

        return { baseNode, turbineNode };


    }

    createCity(gl, shaderProgram, width, depth, rows, cols, minHeight, maxHeight, material) {
        const cityNode = new Node();

        // Calculate spacing based on the city dimensions and number of buildings
        const spacingX = width / (cols - 1);
        const spacingZ = depth / (rows - 1);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const buildingWidth = 1.5;

                // Randomize the height between minHeight and maxHeight
                const height = Math.random() * (maxHeight - minHeight) + minHeight;

                // Create the building
                const building = NormalMesh.box(gl, shaderProgram, buildingWidth, height, buildingWidth, material);
                const buildingNode = cityNode.addChild(building);

                // Position the building evenly spaced across the city area
                buildingNode.position = new Vec4(
                    col * spacingX - width / 2, // Center the city on the plane
                    height / 2,               // Center the building vertically
                    row * spacingZ - depth / 2, // Center the city on the plane
                    1
                );
            }
        }
        return cityNode;
    }
    

    render(currentTime) {
        if (!this.startTime) {
            this.startTime = currentTime; // Initialize the start time
        }
    
        const elapsedTime = (currentTime - this.startTime) / 1000; // Convert ms to seconds

        const fullRotationTime = 100; // moon rotation
        const turbineRotationTime = 20;
        const helicopterTime = 16;
        const propSpin = 1;
        const tireSpin = 0.7;
    
        // Calculate the roll value (modulus ensures it loops continuously)
        this.sunbind.roll = (elapsedTime / fullRotationTime) % 1;
        this.turbine.roll = (elapsedTime / turbineRotationTime) % 1;

        this.topProp.yaw = (elapsedTime / propSpin) % 1;
        this.backProp.pitch = (elapsedTime / propSpin) % 1;
        this.heliAnchor.yaw = -(elapsedTime / helicopterTime) % 1;


        // car animation
        const squareTime = 16; // Total time to complete the square in seconds
        const legTime = 4; // Time for each leg of the square
        const turnTime = 1; // Time allocated for turning at the end of the leg
        const totalLegs = 4; // Total legs in the square
    
        const legProgress = elapsedTime % squareTime; // Time within the current loop of the square
        const currentLeg = Math.floor(legProgress / legTime); // Current leg index (0 to 3)
        const legElapsedTime = legProgress % legTime; // Time elapsed within the current leg
        const legProgressNormalized = legElapsedTime / legTime; // Normalized progress within the current leg (0 to 1)
    
        // Define square corners
        const positions = [
            new Vec4(4.5, 0, 4.5, 0),
            new Vec4(-4.5, 0, 4.5, 0),
            new Vec4(-4.5, 0, -4.5, 0),
            new Vec4(4.5, 0, -4.5, 0)
        ];
    
        // Compute car position based on current leg
        const startPosition = positions[currentLeg];
        const nextPosition = positions[(currentLeg + 1) % totalLegs];
        this.car.position = new Vec4(
            startPosition.x + (nextPosition.x - startPosition.x) * legProgressNormalized,
            startPosition.y + (nextPosition.y - startPosition.y) * legProgressNormalized,
            startPosition.z + (nextPosition.z - startPosition.z) * legProgressNormalized,
            0
        );
    
        // Compute car yaw for smooth turning in the last turnTime of the leg
        const directions = [-0.25, -0.5, -0.75, 0]; // Yaw directions (in tau: 0, 90°, 180°, 270°)
        const startYaw = directions[currentLeg];
        const nextYaw = directions[(currentLeg + 1) % totalLegs];
    
        // Ensure yaw rotates in the shortest direction
        let deltaYaw = nextYaw - startYaw;
        if (deltaYaw > 0.5) deltaYaw -= 1; // Adjust for shortest rotation (clockwise)
        if (deltaYaw < -0.5) deltaYaw += 1; // Adjust for shortest rotation (counter-clockwise)
    
        if (legElapsedTime >= legTime - turnTime) {
            // Start turning during the last turnTime of the leg
            const turnProgress = (legElapsedTime - (legTime - turnTime)) / turnTime; // Normalized progress within turnTime
            this.car.yaw = (startYaw + deltaYaw * turnProgress + 1) % 1; // Ensure yaw stays within bounds (0 to 1 in tau)
        } else {
            // Keep yaw constant during the movement phase
            this.car.yaw = startYaw;
        }

        this.frontWheels.pitch = -(elapsedTime / tireSpin) % 1;
        this.backWheels.pitch = -(elapsedTime / tireSpin) % 1;
    
        // Render the scene
        this.scene.render(this.gl, this.shaderProgram);
    }
    
}
