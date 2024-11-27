# gl-city


# scene Graphs Notes:

 class Node { // everything we’re about to do is in the “Node” class.
• constructor( data ) {
// in homogenous coordinates, w = 0 is a vector, w != 0 is a point
this.position = new Vec4( 0, 0, 0, 1 );
this.scale = new Vec4( 1, 1, 1, 1 );
this.roll = 0;
this.pitch = 0;
this.yaw = 0;
this.data = data;
this.children = [];
}


add_child() {
let child = new Node();
this.children.push( child );
return child;
}

get_matrix() {
let matrix = new Mat4();
matrix = matrix.mul( Mat4.translation( this.position ) );
matrix = matrix.mul( Mat4.rotation_xz( this.yaw ) );
matrix = matrix.mul( Mat4.rotation_yz( this.pitch ) );
matrix = matrix.mul( Mat4.rotation_xy( this.roll ) );
matrix = matrix.mul( Mat4.scale( this.scale ) );
return matrix;
}



class RenderMesh {
constructor ( matrix, mesh ) {
this.matrix = matrix;
this.mesh = mesh;
}
}



function generate_render_jobs( parent_matrix, node, jobs ) {
//...
}