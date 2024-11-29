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
     * Create a flat platform in the xz plane.
     * @param {WebGLRenderingContext} gl 
     */
    static platform( gl, program, width, depth, uv_min, uv_max, material ) {
        let hwidth = width / 2;
        let hdepth = depth / 2;
        
        let verts = [
            -hwidth, 0, -hdepth,  1.0, 1.0, 1.0, 1.0,     uv_min, uv_max,   0.0, 1.0, 0.0,
            hwidth, 0, -hdepth,   1.0, 1.0, 1.0, 1.0,     uv_max, uv_max,   0.0, 1.0, 0.0,
            hwidth, 0, hdepth,    1.0, 1.0, 1.0, 1.0,     uv_max, uv_min,   0.0, 1.0, 0.0,
            -hwidth, 0, hdepth,   1.0, 1.0, 1.0, 1.0,     uv_min, uv_min,   0.0, 1.0, 0.0,
        ];

        let indis = [ 0, 1, 2, 2, 3, 0, ];

        return new NormalMesh( gl, program, verts, indis, material, false );
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

    /**
 * Parse the given text as the body of an OBJ file and create a Mesh.
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {string} text
 * @returns {NormalMesh}
 */
    static from_obj_text(gl, program, text, material) {
        let lines = text.split(/\r?\n/);
    
        let coords = []; // x, y, z, r, g, b, a per vertex
        let normal = [];
        let elements = []; // indices
    
        let positions = []; // x, y, z per vertex
    
        let y_min = Infinity;
        let y_max = -Infinity;
    
        for (let line of lines) {
            line = line.trim();
    
            if (line.startsWith('#') || line === '') {
                continue;
            }
    
            let parts = line.split(/\s+/);
    
            if (parts[0] === 'v') {
                // vertex line v x y z
                let x = parseFloat(parts[1]);
                let y = parseFloat(parts[2]);
                let z = parseFloat(parts[3]);
    
                positions.push([x, y, z]);
                // update y_min and y_max for color scaling
                if (y < y_min) y_min = y;
                if (y > y_max) y_max = y;
    
            } else if (parts[0] === 'f') {
                // Face line f v1 v2 v3 ...
                let v1 = parseInt(parts[1], 10) -1
                let v2 = parseInt(parts[2], 10) -1
                let v3 = parseInt(parts[3], 10) -1
                elements.push(v1, v2, v3)
            }
    
            
        }

        
    
        // create the vertex array, including colors
        for (let i = 0; i < positions.length; i++) {
            let [x, y, z] = positions[i];
            
            
            
            let pos_vec = new Vec4(x, y, z, 0.0);
            let pos_norm;

            if (pos_vec.length() === 0) {
                // Assign a default normal if the vector length is zero
                pos_norm = new Vec4(0.0, 1.0, 0.0, 0.0); // Example default normal pointing up
            } else {
                pos_norm = pos_vec.norm();
            }
            
            // Vary color based on the y-value
            let t = (y - y_min) / (y_max - y_min);
            coords.push(x, y, z, 1, 0, 1, 1, pos_norm.x, pos_norm.y, pos_norm.x, pos_norm.y, pos_norm.z );
        }
        // create and return the Mesh object
        return new NormalMesh( gl, program, coords, elements, material, true );
    
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

