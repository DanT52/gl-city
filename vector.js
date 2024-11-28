//vector.js

class Vec4 {

    constructor( x, y, z, w ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w ?? 0;
    }

    /**
     * Returns the vector that is this vector scaled by the given scalar.
     * @param {number} by the scalar to scale with 
     * @returns {Vec4}
     */
    scaled( by ) {
        // Multiply each by "by"
        const scaled = new Vec4(this.x * by, this.y * by, this.z * by, this.w * by);
        return scaled;
    }

    /**
     * Returns the dot product between this vector and other
     * @param {Vec4} other the other vector 
     * @returns {number}
     */
    dot( other ) {
        const dot = this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w;
        return dot;
    }

      /**
     * Returns the length of this vector
     * @returns {number}
     */
    length() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        return length;
    }

    /**
     * Returns a normalized version of this vector
     * @returns {Vec4}
     */
    norm() {
        const length = this.length();
        if (length === 0) {
            throw new Error('cannot normalize vector with length 0');
        }

        const normal = this.scaled( 1/length )

        return normal;
    }

    /**
     * Returns the vector sum between this and other.
     * @param {Vec4} other 
     */
    add( other ) {
        const add = new Vec4(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w);
        return add;
    }

    sub( other ) {
        return this.add( other.scaled( -1 ) );
    }

    cross( other ) {
        let x = this.y * other.z - this.z * other.y;
        let y = this.x * other.z - this.z * other.x; // maybe should be  let y = this.z * other.x - this.x * other.z; ?
        let z = this.x * other.y - this.y * other.x;

        return new Vec4( x, y, z, 0 );
    }
    /**
     * Calculate the normal of the given triangle. 
     * For the resulting normal to point in the positive y direction, p0 to p1 should be to the 
     * left of p0 to p2
     * @param {Vec4} p0 
     * @param {Vec4} p1 
     * @param {Vec4} p2 
     * @returns Vec4
     */
    static normal_of_triangle( p0, p1, p2 ) {
        let v0 = p1.sub( p0 );
        let v1 = p2.sub( p0 );
        return v0.cross( v1 );
    }
	
	toString() {
		return [ '[', this.x, this.y, this.z, this.w, ']' ].join( ' ' );
	}
}