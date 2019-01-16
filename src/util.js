/**
 * Various utilities
 * 
 * @module util
 */
module.exports = {
    /**
     * Linearly interpolate between two numbers.
     * 
     * @param {number} a a
     * @param {number} b b
     * @param {number} x Factor [0,1]
     */
    lerp: function(a, b, x) {
        return (1-x)*a + x*b
    }
}