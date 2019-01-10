const path = require('path')

const DIST = path.resolve(__dirname, 'dist')

module.exports = {
    entry: {
        main: './src/index.js',
        voronoi: './src/worker/voronoi.js'
    },

    devtool: 'source-map',
    devServer: {
        contentBase: DIST
    },

    output: {
        filename: '[name].js',
        path: DIST
    },

    module: {
        rules: [
            {
                test: /\.(fs|vs)$/,
                use: 'raw-loader'
            }
        ]
    }
}
