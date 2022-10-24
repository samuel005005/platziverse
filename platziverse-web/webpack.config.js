const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { DefinePlugin } = require('webpack')
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
    entry: './client/index.js',
    output: {
        path: __dirname + '/public',
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    // Here you should change 'env' to '@babel/preset-env'
                    presets: ['@babel/preset-env'],
                    plugins: ["@babel/plugin-transform-object-assign"],
                },
            }
        },
        {
            test: /\.css$/,
            use: [
                'vue-style-loader',
                'css-loader',
            ]
        },
        {
            test: /\.vue$/,
            use: 'vue-loader'
        }]
    }, externals: {
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate",
    }, plugins: [
        new VueLoaderPlugin(),
        new DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
            'process.env.API_ENDPOINT': JSON.stringify(process.env.API_ENDPOINT),
            'process.env.API_TOKEN': JSON.stringify(process.env.API_TOKEN),
            'process.env.SERVER_HOST': JSON.stringify(process.env.SERVER_HOST)


        }),
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        { source: 'public', destination: './build/public' }
                    ],
                }
            }
        })
    ],
    resolve: {
        extensions: ['*', '.js', '.jsx', '.tsx', '.ts']
    }
};