class CubeMap {
    constructor(gl, program, folderPath) {
      this.gl = gl;
      this.program = program;
      this.folderPath = folderPath;
  
      // Define the faces and corresponding file names
    this.faceInfos = [
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: `${folderPath}/px.png` },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: `${folderPath}/nx.png` },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: `${folderPath}/py.png` },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: `${folderPath}/ny.png` },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: `${folderPath}/pz.png` },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: `${folderPath}/nz.png` },
    ];
  
      // Initialize the texture
      this.texture = this.gl.createTexture();
      this.gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
  
      // Allocate texture storage and set defaults for each face
      this.faceInfos.forEach((faceInfo) => {
        const { target } = faceInfo;
        this.gl.texImage2D(target, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      });
  
      this.gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      this.gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
      // Load images for each face
      this.loadCubeMapTextures();
  
      // Create a buffer for the cube
      this.cubeBuffer = this.createCubeBuffer();
    }
  
    async loadCubeMapTextures() {
        const gl = this.gl;
        const texture = this.texture;
        const promises = this.faceInfos.map(({ target, url }) => {

          return new Promise((resolve, reject) => {
            console.log(`loaded ${url}`)
            const image = new Image();
            image.src = url;
            image.onload = () => {
              gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
              gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
              resolve();
            };
            image.onerror = () => reject(`Failed to load: ${url}`);
          });
        });
      
        await Promise.all(promises);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      }
      
  
    createCubeBuffer() {
      const gl = this.gl;
  
      // Cube vertex positions
      const vertices = new Float32Array([
        // Positions for each face of the cube
        -1.0,  1.0, -1.0,   -1.0, -1.0, -1.0,    1.0, -1.0, -1.0,  // Front face
         1.0, -1.0, -1.0,    1.0,  1.0, -1.0,   -1.0,  1.0, -1.0,  // Front face
    
        -1.0, -1.0,  1.0,   -1.0, -1.0, -1.0,   -1.0,  1.0, -1.0,  // Left face
        -1.0,  1.0, -1.0,   -1.0,  1.0,  1.0,   -1.0, -1.0,  1.0,  // Left face
    
         1.0, -1.0, -1.0,    1.0, -1.0,  1.0,    1.0,  1.0,  1.0,  // Right face
         1.0,  1.0,  1.0,    1.0,  1.0, -1.0,    1.0, -1.0, -1.0,  // Right face
    
        -1.0, -1.0,  1.0,   -1.0,  1.0,  1.0,    1.0,  1.0,  1.0,  // Back face
         1.0,  1.0,  1.0,    1.0, -1.0,  1.0,   -1.0, -1.0,  1.0,  // Back face
    
        -1.0,  1.0, -1.0,    1.0,  1.0, -1.0,    1.0,  1.0,  1.0,  // Top face
         1.0,  1.0,  1.0,   -1.0,  1.0,  1.0,   -1.0,  1.0, -1.0,  // Top face
    
        -1.0, -1.0, -1.0,   -1.0, -1.0,  1.0,    1.0, -1.0, -1.0,  // Bottom face
         1.0, -1.0, -1.0,   -1.0, -1.0,  1.0,    1.0, -1.0,  1.0   // Bottom face
    ]);
    
      
  
      // Create buffer
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
      return buffer;
    }
  
    render(projection, view) {
      const gl = this.gl;
  
      // Use the cube map shader program
      gl.useProgram(this.program);
  
      // Disable depth write (we want the skybox to appear behind everything)
      gl.depthMask(false);
  
      // Set up cube buffer and attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffer);
      const positionLocation = gl.getAttribLocation(this.program, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
      set_uniform_matrix4( gl, this.program, 'projection', projection.data );
      set_uniform_matrix4( gl, this.program, 'view', view.data );
  
      // Bind the cube map texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
      gl.uniform1i(gl.getUniformLocation(this.program, "u_skybox"), 0);
  
      // Draw the cube
      gl.drawArrays(gl.TRIANGLES, 0, 36);
  
      // Re-enable depth writing
      gl.depthMask(true);
    }
  }
  