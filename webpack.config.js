var path = require('path');
var webpack = require('webpack');
var Uglify = require('uglifyjs-webpack-plugin');

var src = './src/portraycanvas.js';

module.exports = {
    entry: {
      'portraycanvas': src,
      'portraycanvas.min': src
    },
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      libraryTarget: 'var',
      library: 'PortrayCanvas'
    },
    plugins: [
      new Uglify({
        include: /\.min\.js$/
      })]
};
