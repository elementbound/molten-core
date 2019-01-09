const path = require('path')

const DIST = path.resolve(__dirname, 'dist')

module.exports = {
    // mode: 'development',
    entry: './src/index.js',

    devtool: 'inline-source-map',
    devServer: {
        contentBase: DIST
    },

    output: {
        filename: 'main.js',
        path: DIST
    }
}
