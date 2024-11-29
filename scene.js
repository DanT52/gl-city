class Scene {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;

        // Create LitMaterial instances
        this.material = new LitMaterial(gl, 'texture/metal_scale.png', gl.LINEAR, 0.25, 1.0, 2.0, 4.0);
        this.material2 = new LitMaterial(gl, 'texture/concrete.png', gl.LINEAR, 0.1, 0.5, 0, 0.2);

        // Create base elements
        let plane = NormalMesh.platform(gl, shaderProgram, 15, 15, 1, 4, this.material2);

        this.scene = new Node(null);
        this.plane = this.scene.addChild(plane)
        this.plane.yaw = .125
        this.sunbind = this.scene.addChild(null)
        this.mainScene()

        const { baseNode, turbineNode } = this.addTurbine();
        
        this.turbine = turbineNode
        this.plane.children.push(baseNode);
        
    }

    testScene() {

        
        let sphere = NormalMesh.uv_sphere(gl, shaderProgram, 1, 16, this.material);
        let cowNode = new Node()
        cowNode.position = new Vec4(0, 3, 0, 1)
        cowNode.scale = new Vec4(.5, .5, .5, .5)
        cowNode.roll = -.25
        
        

        let sun = new DirectionalLightNode( [1.0, 1.0, 1.0])
        
        sun.position = new Vec4(0, 3, 5, 1)

        let pointLight = new PointLightNode( [1.0, 0.0, 0.0], 1.5)
        this.scene.children.push(pointLight);
        const sphereNode = this.scene.addChild(sphere)
        sphereNode.position = new Vec4(0, 1, 0, 1)

        NormalMesh.from_obj_file(gl, 'OBJs/turbine/base.obj', shaderProgram, this.material, (loadedMesh) => {
            cowNode.data = loadedMesh
        });
        sphereNode.children.push(cowNode);
        sphereNode.roll = .2;
        sphereNode.children.push(sun);


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
            this.material2 // Material for buildings
        );
        cityNode.position = new Vec4(0, 0, 0, 1);
        this.plane.children.push(cityNode);

        // moon
        let sphere = NormalMesh.uv_sphere(gl, shaderProgram, 1, 16, this.material);
        const sphereNode = this.sunbind.addChild(sphere)
        sphereNode.position  = new Vec4(0, 25, 1, 1)
        let sun = new DirectionalLightNode( [0.3, 0.4, 0.4])
        sphereNode.children.push(sun);
        this.sunbind.yaw = .5
        this.sunbind.pitch = .15
        this.sunbind.position.y = 9


        // galaxy perma light

        let galaxyLightNode = new DirectionalLightNode( [0.58, 0.54, 0.6])
        galaxyLightNode.position = new Vec4(1, 10, -30)
        this.scene.children.push(galaxyLightNode)
        
    }

    addTurbine() {

        let baseNode = new Node()
        baseNode.scale = new Vec4(.5, .5, .5, .5);


        NormalMesh.from_obj_file(gl, 'OBJs/turbine/base.obj', shaderProgram, this.material, (loadedMesh) => {
            baseNode.data = loadedMesh;
        });

        let turbineNode = new Node()
        NormalMesh.from_obj_file(gl, 'OBJs/turbine/turbine.obj', shaderProgram, this.material, (loadedMesh) => {
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
        const fullRotationTime = 100; // Time for one full rotation in seconds
        const turbineRotationTime = 20;
    
        // Calculate the roll value (modulus ensures it loops continuously)
        this.sunbind.roll = (elapsedTime / fullRotationTime) % 1;
        this.turbine.roll = (elapsedTime / turbineRotationTime) % 1;
    
        // Render the scene
        this.scene.render(this.gl, this.shaderProgram);
    }
}
