var path = require('path');
var webpack = require('webpack');
var Uglify = require('uglifyjs-webpack-plugin');

var src = './src/drawcanvas.js';

module.exports = {
    entry: {
      'drawcanvas': src,
      'drawcanvas.min': src
    },
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      libraryTarget: 'var',
      library: 'DrawCanvas'
    },
    plugins: [
      new Uglify({
        include: /\.min\.js$/,
        minimize: true
      })]
};
