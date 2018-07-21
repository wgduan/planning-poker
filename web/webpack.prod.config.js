const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config.js');
const fs = require('fs');

let config = require('./src/config/config.base')
if(fs.existsSync('./src/config/config.prod.js'))
{
    let envConfig = require('./src/config/config.prod')   
    config=merge(config,envConfig)     
}
fs.writeFileSync('./src/config/config.js', "module.exports = "+JSON.stringify(config))


module.exports = merge(webpackBaseConfig, {
    output: {
        //publicPath: '/dist/',
        path: path.join(__dirname, './dist'),
        filename: '[name].[chunkHash].js',
        chunkFilename: '[name].[chunkHash].chunk.js'
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].[chunkHash].css',
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'vendors.[chunkHash].js'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        // new HtmlWebpackPlugin({
        //     filename: '../index_prod.html',
        //     template: './src/template/index.ejs',
        //     inject: false
        // })
        new HtmlWebpackPlugin({
            template: './src/index.html',
            //inject:true,
        })
    ]
});