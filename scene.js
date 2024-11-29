class Scene {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;

        // Create LitMaterial instances
        this.material = new LitMaterial(gl, 'texture/metal_scale.png', gl.LINEAR, 0.25, 1.0, 2.0, 4.0);
        this.material2 = new LitMaterial(gl, 'texture/concrete.png', gl.LINEAR, 0.25, 0.5, 0, 0.2);

        // Create base elements
        let plane = NormalMesh.platform(gl, shaderProgram, 15, 15, 1, 4, this.material2);
        this.scene = new Node(plane);
        this.mainScene()
    }

    testScene() {
        let sphere = NormalMesh.uv_sphere(gl, shaderProgram, 1, 16, this.material);
        let cowNode = new Node()
        cowNode.position = new Vec4(0, 4, 0, 1)
        cowNode.scale = new Vec4(.5, .5, .5, .5)
        cowNode.roll = -.25
        
        

        let sun = new DirectionalLightNode([1.0, -1.0, 0.0], [1.0, 1.0, 1.0])
        this.scene.children.push(sun);

        let pointLight = new PointLightNode([0.0, 2.0, -2.0], [1.0, 0.0, 0.0], 1.5)
        this.scene.children.push(pointLight);


        NormalMesh.from_obj_file(gl, 'OBJs/cow.obj', shaderProgram, this.material, (loadedMesh) => {
            cowNode.data = loadedMesh
        });
        this.scene.children.push(cowNode);
        const sphereNode = this.scene.addChild(sphere)
        sphereNode.position = new Vec4(0, 1, 0, 1)


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
        this.scene.children.push(cityNode);

        // sun
        let sphere = NormalMesh.uv_sphere(gl, shaderProgram, 1, 16, this.material);
        const sphereNode = this.scene.addChild(sphere)
        sphereNode.position  = new Vec4(0, 5, 1, 1)
        
        let sun = new DirectionalLightNode([2, -1.0, 3], [1.0, 1.0, 1.0])
        this.scene.children.push(sun);
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

    render() {
        this.scene.render(this.gl, this.shaderProgram);
    }
}
