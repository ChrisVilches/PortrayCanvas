var DrawCanvas =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Util = __webpack_require__(1);
var Renderer = __webpack_require__(2);

module.exports = class DrawCanvas {

  constructor(canvasDOM, options){

    if(canvasDOM.hasOwnProperty('length')){
      // It probably is a jQuery object
      canvasDOM = canvasDOM[0];
    }

    if(canvasDOM.tagName.toLowerCase() !== 'canvas'){
      throw new Error("Element is not a canvas.");
    }


    this.canvas = canvasDOM;
    this.context = this.canvas.getContext('2d');
    this.started = false;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.memCanvas = document.createElement('canvas');
    this.memCanvas.width = this.canvas.width;
    this.memCanvas.height = this.canvas.height;
    this.memCtx = this.memCanvas.getContext('2d');
    this.undoHistory = [];

    this.renderer = new Renderer(this.canvas);

    this.init();
    this.setOptions(options);
    this.canvas.addEventListener('mousedown', this.eventCanvas.bind(this), false);
    this.canvas.addEventListener('mousemove', this.eventCanvas.bind(this), false);
    this.canvas.addEventListener('mouseup', this.eventCanvas.bind(this), false);
    this.canvas.addEventListener('mouseout', this.eventCanvas.bind(this), false);
  }

  setOptions(options){

    this.context.strokeStyle = Util.rgb2hex(Util.getStyleProp(this.canvas, 'color'));
    this.context.lineWidth = 5;
    this.period = 5;
    this.onLineFinish = null;
    this.onClear = null;
    this.onUndo = null;

    if(typeof options !== 'object' || options == null) return;

    if(typeof options.color === 'string')
      this.context.strokeStyle = options.color;

    if(typeof options.lineWidth === 'number')
      this.context.lineWidth = options.lineWidth;

    if(typeof options.period === 'number')
      this.period = options.period;

    if(typeof options.onLineFinish === 'function')
      this.onLineFinish = options.onLineFinish;

    if(typeof options.onClear === 'function')
      this.onClear = options.onClear;

    if(typeof options.onUndo === 'function')
      this.onUndo = options.onUndo;

    this.colorDefault = this.context.strokeStyle;
  }

  setColor(color){
    this.context.strokeStyle = color;
  }

  revertDefaultColor(){
    this.context.strokeStyle = this.colorDefault;
  }

  isEmpty(){
    return this.lines.length == 0;
  }

  getLines(){
    return this.lines;
  }

  undo(){
    this.undoHistory.pop();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Grab the previous state, and copy it into both canvas
    if(this.undoHistory.length > 0){
      var prev = this.undoHistory[this.undoHistory.length - 1];
      this.context.drawImage(prev, 0, 0);
      this.memCtx.drawImage(prev, 0, 0);
    }

    let line = this.lines.pop();

    if(this.onUndo != null)
      this.onUndo(line, this);
  }

  init(){
    this.points = [];
    this.count = 0;
    this.tempLine = [];
    this.lines = [];
    this.firstTimestamp = -1;
  }

  eventCanvas(ev) {
    ev.point = {
      x: ev.offsetX / this.canvas.offsetWidth,
      y: ev.offsetY / this.canvas.offsetWidth
    };
    var func = this[ev.type].bind(this);
    if (func)
      func(ev);
  }

  // Pushes a new dot to the temporary line
  addDotToTempLine(point){

    let time = 0;

    if(this.tempLine.length == 0 && this.lines.length == 0){
      time = 0;
      this.firstTimestamp = new Date().getTime();
    } else {
      time = new Date().getTime() - this.firstTimestamp;
    }

    point.timestamp = time;
    this.tempLine.push(point);
  }


  drawLine(points){

    // Add timestamps automatically
    var time;
    if(this.lines.length == 0){
      time = 0;
      this.firstTimestamp = new Date().getTime();
    } else {
      time = new Date().getTime() - this.firstTimestamp;
    }
    points.map(e => e.timestamp = time++);

    this.tempLine = points;
    this.renderer.drawPoints(this.context, points);
    this.lineFinish();
  }


  lineFinish(){

    // Save state in history (creating a new canvas)
    var canvasCopy = document.createElement('canvas');
    canvasCopy.width = this.canvas.width;
    canvasCopy.height = this.canvas.height;
    var canvasCopyCtx = canvasCopy.getContext('2d');
    canvasCopyCtx.drawImage(this.canvas, 0, 0);
    this.undoHistory.push(canvasCopy);

    // Push the new line to the line array
    this.lines.push(this.tempLine);

    // Clears temporary line
    this.tempLine = [];
    if(this.onLineFinish != null)
      this.onLineFinish(this);
  }


  mousedown(ev) {
    this.count = 0;
    this.addDotToTempLine(ev.point);
    this.renderer.drawDot(this.context, ev.point.x, ev.point.y);
    this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.memCtx.drawImage(this.canvas, 0, 0);
    this.points.push(ev.point);
    this.started = true;
    this.renderer.drawPoints(this.context, this.points);
  }

  mousemove(ev) {

    if(!this.started) return;

    this.count++;
    if(this.count == this.period){
      this.addDotToTempLine(ev.point);
      this.count = 0;
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.memCanvas, 0, 0);
    this.points.push(ev.point);
    this.renderer.drawPoints(this.context, this.points);

  }

  mouseup(ev) {

    if(!this.started) return;

    this.started = false;
    this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.memCtx.drawImage(this.canvas, 0, 0);
    this.points = [];
    this.addDotToTempLine(ev.point);
    this.lineFinish();
  }

  mouseout(ev){
    this.mouseup(ev);
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.undoHistory = [];
    this.init();

    if(this.onClear != null)
      this.onClear(this);
  }

}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class Util {
  static rgb2hex(rgb){

    var rgbRegex = new RegExp(/^rgb\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)$/);

    var rgb = rgb.match(rgbRegex);

    if(rgb == null)
      return '#000000';

    function process(component){
      let c = Number(component);
      if(c > 255) c = 255;
      c = c.toString(16);
      if(c.length == 1)
        c = '0' + c;
      return c;
    }
    return `#${process(rgb[1])}${process(rgb[2])}${process(rgb[3])}`;
  }
  

  static getStyleProp(elem, prop){
    if(window.getComputedStyle)
      return window.getComputedStyle(elem, null).getPropertyValue(prop);
    else if(elem.currentStyle)
      return elem.currentStyle[prop];
  }
}

module.exports = Util;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class Renderer {

  constructor(canvas){
    this.canvasWidth = canvas.width;
  }

  drawPoints(ctx, points) {

    if(points.length == 2){
      ctx.beginPath();
      ctx.moveTo(points[0].x * this.canvasWidth, points[0].y * this.canvasWidth);
      ctx.lineTo(points[1].x * this.canvasWidth, points[1].y * this.canvasWidth);
      ctx.stroke();
      return;
    }

    ctx.beginPath();

    ctx.moveTo(points[0].x * this.canvasWidth, points[0].y * this.canvasWidth);
    for (var i = 1; i < points.length - 2; i++) {
        var c = ((points[i].x* this.canvasWidth) + (points[i + 1].x* this.canvasWidth)) / 2,
            d = ((points[i].y * this.canvasWidth) + (points[i + 1].y * this.canvasWidth)) / 2;
        ctx.quadraticCurveTo(points[i].x * this.canvasWidth, points[i].y * this.canvasWidth, c, d);
    }
    if(i < points.length - 1){
      ctx.quadraticCurveTo(
        points[i].x * this.canvasWidth,
        points[i].y * this.canvasWidth,
        points[i + 1].x * this.canvasWidth,
        points[i + 1].y * this.canvasWidth);
    }
    ctx.stroke();
  }

  drawDot(ctx, x, y){
    ctx.beginPath();
    ctx.arc(x * this.canvasWidth, y * this.canvasWidth, ctx.lineWidth/2, 0, 2 * Math.PI, false);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }
}

module.exports = Renderer;


/***/ })
/******/ ]);
//# sourceMappingURL=drawcanvas.js.map