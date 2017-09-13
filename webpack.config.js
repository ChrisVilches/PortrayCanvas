var path = require('path');

module.exports = {
    entry: "./src/drawcanvas.js",
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "bundle.js",
        libraryTarget: 'var',
        library: 'DrawCanvas'
    }
};
