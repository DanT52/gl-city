const VERTEX_STRIDE = 48;


class NormalMesh {
    /** 
     * Creates a new mesh and loads it into video memory.
     * 
     * @param {WebGLRenderingContext} gl  
     * @param {number} program
     * @param {number[]} vertices
     * @param {number[]} indices
    */
    constructor( gl, program, vertices, indices, material, use_color ) {
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.indis = create_and_load_elements_buffer( gl, indices, gl.STATIC_DRAW );

        this.n_verts = vertices.length / VERTEX_STRIDE * 4;
        this.n_indis = indices.length;
        this.program = program;
        this.material = material;

        this.use_color = use_color ?? false;
    }

    set_vertex_attributes() {
        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "coordinates", 
            this.verts, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 0 
        );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "color", 
            this.verts, 4, 
            gl.FLOAT, false, VERTEX_STRIDE, 12
        );

        set_vertex_attrib_to_buffer( 
            gl, this.program,
            "uv",
            this.verts, 2,
            gl.FLOAT, false, VERTEX_STRIDE, 28
        );

        set_vertex_attrib_to_buffer(
            gl, this.program, 
            "normal",
            this.verts, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 36
        )
    }
    

    /**
     * Create a box mesh with the given dimensions and colors. Creates normals.
     * @param {WebGLRenderingContext} gl 
     */

    static box( gl, program, width, height, depth, material ) {
        let hwidth = width / 2.0;
        let hheight = height / 2.0;
        let hdepth = depth / 2.0;

        let verts = [
            hwidth, -hheight, -hdepth,  1.0, 0.0, 1.0, 1.0,     1.0, 1.0,   0.0, 0.0, -1.0,
            -hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0,     0.0, 1.0,   0.0, 0.0, -1.0,
            -hwidth, hheight, -hdepth,  0.5, 0.5, 1.0, 1.0,     0.0, 0.0,   0.0, 0.0, -1.0,
            hwidth, hheight, -hdepth,   1.0, 1.0, 0.5, 1.0,     1.0, 0.0,   0.0, 0.0, -1.0,

            hwidth, -hheight, hdepth,   1.0, 0.0, 1.0, 1.0,     1.0, 1.0,   1.0, 0.0, 0.0,
            hwidth, -hheight, -hdepth,  0.0, 1.0, 1.0, 1.0,     0.0, 1.0,   1.0, 0.0, 0.0,
            hwidth, hheight, -hdepth,   0.5, 0.5, 1.0, 1.0,     0.0, 0.0,   1.0, 0.0, 0.0,
            hwidth, hheight, hdepth,    1.0, 1.0, 0.5, 1.0,     1.0, 0.0,   1.0, 0.0, 0.0,

            -hwidth, -hheight, hdepth,  1.0, 0.0, 1.0, 1.0,     1.0, 1.0,   0.0, 0.0, 1.0,
            hwidth, -hheight, hdepth,   1.0, 1.0, 0.5, 1.0,     0.0, 1.0,   0.0, 0.0, 1.0,
            hwidth, hheight, hdepth,    0.5, 0.5, 1.0, 1.0,     0.0, 0.0,   0.0, 0.0, 1.0,
            -hwidth, hheight, hdepth,   0.0, 1.0, 1.0, 1.0,     1.0, 0.0,   0.0, 0.0, 1.0,
            
            -hwidth, -hheight, hdepth,  1.0, 0.0, 1.0, 1.0,     0.0, 1.0,   -1.0, 0.0, 0.0,
            -hwidth, -hheight, -hdepth, 0.0, 1.0, 1.0, 1.0,     1.0, 1.0,   -1.0, 0.0, 0.0,
            -hwidth, hheight, -hdepth,  0.5, 0.5, 1.0, 1.0,     1.0, 0.0,   -1.0, 0.0, 0.0,
            -hwidth, hheight, hdepth,   1.0, 1.0, 0.5, 1.0,     0.0, 0.0,   -1.0, 0.0, 0.0,

            -hwidth, hheight, -hdepth,  1.0, 0.0, 0.0, 1.0,     0.0, 1.0,   0.0, 1.0, 0.0,
            hwidth, hheight, -hdepth,   0.0, 1.0, 0.0, 1.0,     1.0, 1.0,   0.0, 1.0, 0.0,
            hwidth, hheight, hdepth,    0.0, 0.0, 1.0, 1.0,     1.0, 0.0,   0.0, 1.0, 0.0,
            -hwidth, hheight, hdepth,   1.0, 1.0, 0.0, 1.0,     0.0, 0.0,   0.0, 1.0, 0.0,

            -hwidth, -hheight, -hdepth, 1.0, 0.0, 0.0, 1.0,     0.0, 1.0,   0.0, -1.0, 0.0,
            hwidth, -hheight, -hdepth,  0.0, 1.0, 0.0, 1.0,     1.0, 1.0,   0.0, -1.0, 0.0,
            hwidth, -hheight, hdepth,   0.0, 0.0, 1.0, 1.0,     1.0, 0.0,   0.0, -1.0, 0.0,
            -hwidth, -hheight, hdepth,  1.0, 1.0, 0.0, 1.0,     0.0, 0.0,   0.0, -1.0, 0.0,
        ];

        let indis = [
            // clockwise winding
            //0, 3, 2, 2, 1, 0,
            //4, 7, 6, 6, 5, 4,
            //8, 11, 10, 10, 9, 8,
            //12, 13, 14, 14, 15, 12,
            //16, 17, 18, 18, 19, 16,
            //20, 23, 22, 22, 21, 20,
            
            // counter-clockwise winding
            2, 1, 0, 2, 0, 3,
            6, 5, 4, 4, 7, 6,
            10, 9, 8, 8, 11, 10,
            12, 13, 14, 14, 15, 12,
            16, 17, 18, 18, 19, 16,
            22, 21, 20, 20, 23, 22,
        ];

        return new NormalMesh( gl, program, verts, indis, material, false );
    }

    /**
     * Create a flat platform in the xz plane, subdivided so that it has better lighting effects
     * @param {WebGLRenderingContext} gl 
     */
    static platform(gl, program, width, depth, uv_min, uv_max, material) {
      const hwidth = width / 2;
      const hdepth = depth / 2;

      // subdivide
      const rows = 50;
      const cols = 50;
      const dx = width / cols;
      const dz = depth / rows;
      const du = (uv_max - uv_min) / cols;
      const dv = (uv_max - uv_min) / rows;

      let verts = [];
      let indis = [];

      // generate vertices and UV coordinates
      for (let row = 0; row <= rows; row++) {
          for (let col = 0; col <= cols; col++) {
              const x = -hwidth + col * dx;
              const z = -hdepth + row * dz;
              const u = uv_min + col * du;
              const v = uv_min + row * dv;

              verts.push(
                  x, 0, z,           // position
                  1.0, 1.0, 1.0, 1.0, // color (default white)
                  u, v,             // UV coordinates
                  0.0, 1.0, 0.0     // normal (pointing up)
              );
          }
      }

      // generate indices for the grid
      for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
              const topLeft = row * (cols + 1) + col;
              const topRight = topLeft + 1;
              const bottomLeft = topLeft + (cols + 1);
              const bottomRight = bottomLeft + 1;

              // two triangles per square
              indis.push(topLeft, bottomLeft, bottomRight);
              indis.push(topLeft, bottomRight, topRight);
          }
      }

      return new NormalMesh(gl, program, verts, indis, material, false);
    }

    /**
     * Load a mesh from a heightmap.
     * @param {WebGLRenderingContext} gl 
     * @param {WebGLProgram} program
     * @param {number][][]} map
     * @param {number} min 
     * @param {number} max
     */
    static from_heightmap( gl, program, map, min, max, material ) {
        let rows = map.length;
        let cols = map[0].length;
        const MIN_HEIGHT_COLOR = 0.2;

        let off_x = cols / 2;
        let off_z = rows / 2;

        let verts = [];
        let indis = [];

        function color( height ) {
            let normed_height = height / ( max - min );
            return MIN_HEIGHT_COLOR + normed_height * ( 1 - MIN_HEIGHT_COLOR );
        }

        function push_vert( verts, vert, u, v, normal ) {
            verts.push( vert.x, vert.y, vert.z );
            let vert_bright = color( vert.y );
            verts.push( vert_bright, vert_bright, vert_bright, 1.0 );
            verts.push( u, v );
            verts.push( normal.x, normal.y, normal.z );
        }

        for( let row = 1; row < rows; row++ ) {
            for( let col = 1; col < cols; col++ ) {
                let indi_start = indis.length;

                let pos_tl = map[row - 1][col - 1];
                let pos_tr = map[row - 1][col];
                let pos_bl = map[row][col - 1];
                let pos_br = map[row][col];

                let v_tl = new Vec4( -1, pos_tl, -1 );
                let v_tr = new Vec4( 0, pos_tr, -1 );
                let v_bl = new Vec4( -1, pos_bl, 0 );
                let v_br = new Vec4( 0, pos_br, 0 );

                let normal_t1 = Vec4.normal_of_triangle( v_tl, v_tr, v_bl );
                let normal_t2 = Vec4.normal_of_triangle( v_br, v_bl, v_tr );

                // debug
                // normal_t1 = new Vec4( 0, 1, 0 );
                // normal_t2 = new Vec4( 0, 1, 0 );

                v_tl.x += col - off_x;
                v_tl.z += row - off_z;
                v_tr.x += col - off_x;
                v_tr.z += row - off_z;
                v_bl.x += col - off_x;
                v_bl.z += row - off_z;
                v_br.x += col - off_x;
                v_br.z += row - off_z;

                push_vert( verts, v_tl, 0, 1, normal_t1 );
                push_vert( verts, v_tr, 1, 1, normal_t1 );
                push_vert( verts, v_bl, 0, 0, normal_t1 );

                push_vert( verts, v_br, 1, 0, normal_t2 );
                push_vert( verts, v_bl, 0, 0, normal_t2 );
                push_vert( verts, v_tr, 1, 1, normal_t2 );

                indis.push( 
                    indi_start,
                    indi_start + 1,
                    indi_start + 2,
                    indi_start + 3,
                    indi_start + 4,
                    indi_start + 5
                );
            }
        }

        return new NormalMesh( gl, program, verts, indis, material, true );
    }

    /**
     * Render the mesh. Does NOT preserve array/index buffer, program, or texture bindings! 
     * 
     * @param {WebGLRenderingContext} gl 
     */
    render( gl ) {
        // gl.enable( gl.CULL_FACE );
        
        gl.useProgram( this.program );
        this.set_vertex_attributes();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.verts );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indis );
        bind_texture_samplers( gl, this.program, "tex_0" );

        gl.activeTexture( gl.TEXTURE0 );
        this.material.bind( gl, this.program );

        set_uniform_int( gl, this.program, 'use_color', this.use_color );

        gl.drawElements( gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0 );
    }

    /**
     * Create a UV sphere.
     * @param {WebGLRenderingContext} gl 
     * @param {WebGLProgram} program 
     * @param {number} radius 
     * @param {number} subdivs the number of subdivisions, both vertically and radially
     * @param {Object} material 
     * @returns {NormalMesh}
     */
    static uv_sphere(gl, program, radius, subdivs, material) {
        if (subdivs < 3) {
            throw new Error("subdivs must be at least 3. value: " + subdivs);
        }

        let verts = [];
        let indis = [];
        const TAU = 2 * Math.PI;

        for (let layer = 0; layer <= subdivs; layer++) {
            let y_turns = layer / subdivs / 2;
            let y = Math.cos(y_turns * TAU) / 2;
            let radius_scale_for_layer = Math.sin(y_turns * TAU);

            for (let subdiv = 0; subdiv <= subdivs; subdiv++) {
                let turns = subdiv / subdivs;
                let rads = turns * TAU;

                let x = Math.cos(rads) / 2 * radius_scale_for_layer;
                let z = Math.sin(rads) / 2 * radius_scale_for_layer;

                let point_norm = new Vec4(x, y, z, 0.0).norm();
                let scaled_point = point_norm.scaled(radius);

                verts.push(scaled_point.x, scaled_point.y, scaled_point.z); // positions
                verts.push(1, 1, 1, 1); // color
                verts.push(turns, y_turns * 2); // UVs
                verts.push(point_norm.x, point_norm.y, point_norm.z); // normals
            }
        }

        function get_indi_no_from_layer_and_subdiv_no(layer, subdiv) {
            let layer_start = layer * (subdivs + 1);
            return layer_start + subdiv % (subdivs + 1);
        }

        for (let layer = 1; layer <= subdivs; layer++) {
            for (let subdiv = 0; subdiv < subdivs; subdiv++) {
                let i0 = get_indi_no_from_layer_and_subdiv_no(layer - 1, subdiv);
                let i1 = get_indi_no_from_layer_and_subdiv_no(layer - 1, subdiv + 1);
                let i2 = get_indi_no_from_layer_and_subdiv_no(layer, subdiv);
                let i3 = get_indi_no_from_layer_and_subdiv_no(layer, subdiv + 1);

                indis.push(i0, i2, i3, i3, i1, i0);
            }
        }

        return new NormalMesh(gl, program, verts, indis, material, false);
    }

    
// some of this parsing code is from https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
static from_obj_text(gl, program, text, material) {
    const objPositions = [];
    const objTexcoords = [];
    const objNormals = [];
  
    const positionBuffer = [];
    const texcoordBuffer = [];
    const normalBuffer = [];
    const indices = [];
    const indexMap = new Map(); // Map to store "index string" -> "new index"
  
    let indexCounter = 0;
  
    const keywords = {
      v(parts) {
        objPositions.push(parts.map(parseFloat));
      },
      vn(parts) {
        objNormals.push(parts.map(parseFloat));
      },
      vt(parts) {
        objTexcoords.push(parts.map(parseFloat));
      },
      f(parts) {
        const numTriangles = parts.length - 2;
        for (let tri = 0; tri < numTriangles; ++tri) {
          processVertex(parts[0]);
          processVertex(parts[tri + 1]);
          processVertex(parts[tri + 2]);
        }
      },
    };
  
    function processVertex(vert) {
      if (!vert) return;
  
      // Parse the face vertex format "v/vt/vn"
      const ptn = vert.split('/');
      const positionIndex = parseInt(ptn[0]) - 1;
      const texcoordIndex = ptn[1] ? parseInt(ptn[1]) - 1 : -1;
      const normalIndex = ptn[2] ? parseInt(ptn[2]) - 1 : -1;
  
      const key = `${positionIndex}/${texcoordIndex}/${normalIndex}`;
  
      if (indexMap.has(key)) {
        // Reuse the existing index
        indices.push(indexMap.get(key));
      } else {
        // Create a new index
        if (positionIndex >= 0) {
          positionBuffer.push(...objPositions[positionIndex]);
        } else {
          positionBuffer.push(0, 0, 0);
        }
  
        if (texcoordIndex >= 0) {
          texcoordBuffer.push(...objTexcoords[texcoordIndex]);
        } else {
          texcoordBuffer.push(0, 0);
        }
  
        if (normalIndex >= 0) {
          normalBuffer.push(...objNormals[normalIndex]);
        } else {
          normalBuffer.push(0, 0, 0);
        }
  
        indexMap.set(key, indexCounter);
        indices.push(indexCounter);
        indexCounter++;
      }
    }
  
    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      const m = keywordRE.exec(line);
      if (!m) {
        continue;
      }
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) {
        console.warn('unhandled keyword:', keyword); // eslint-disable-line no-console
        continue;
      }
      handler(parts, unparsedArgs);
    }
  
    let coords = []; // x, y, z, r, g, b, a, u, v, nx, ny, nz per vertex
    for (let i = 0; i < positionBuffer.length / 3; i++) {
      const x = positionBuffer[i * 3 + 0];
      const y = positionBuffer[i * 3 + 1];
      const z = positionBuffer[i * 3 + 2];
  
      const u = texcoordBuffer[i * 2 + 0] || 0;
      const v = texcoordBuffer[i * 2 + 1] || 0;
  
      const nx = normalBuffer[i * 3 + 0] || 0;
      const ny = normalBuffer[i * 3 + 1] || 0;
      const nz = normalBuffer[i * 3 + 2] || 0;
  
      coords.push(x, y, z, 1, 0, 1, 1, u, v, nx, ny, nz);
    }
  
    return new NormalMesh(gl, program, coords, indices, material, true);
  }
  

    /**
     * Asynchronously load the obj file as a mesh.
     * @param {WebGLRenderingContext} gl
     * @param {string} file_name 
     * @param {WebGLProgram} program
     * @param {function} f the function to call and give mesh to when finished.
     */
    static from_obj_file(gl, file_name, program, material, callback) {
        let request = new XMLHttpRequest();
        
        request.onreadystatechange = function() {
            if (request.readyState != 4) { return; }
            if (request.status != 200) { 
                throw new Error('HTTP error when opening .obj file: ' + request.statusText); 
            }

            let loaded_mesh = NormalMesh.from_obj_text(gl, program, request.responseText, material);
            console.log('loaded ', file_name);
            callback(loaded_mesh);
        };

        request.open('GET', file_name);
        request.send();
    }

}

