/**
 * Base webpack config used across other specific configs.
 */
import webpack from 'webpack';

export default {
    devtool: 'source-map',
    target: 'electron-main',
    entry: {
        index: './src-electron/index.js'
    },
    output: {
        path: __dirname,
        filename: './app/src-electron/[name].js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [{
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: ['node_modules']
    },
    plugins: [
        new webpack.NamedModulesPlugin()
    ],
    node: {
        __dirname: false,
        __filename: false
    }
}
