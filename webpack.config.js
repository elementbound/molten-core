const path = require('path')

const DIST = path.resolve(__dirname, 'dist')

module.exports = {
    entry: {
        main: './src/index.js',
    },

    devtool: 'source-map',
    optimization: {
        minimize: false
    },

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
            },

            {
                test: /\.worker\.js$/,
                use: 'worker-loader'
            }
        ]
    }
}
