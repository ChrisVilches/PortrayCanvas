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
var Drawer = __webpack_require__(2);

module.exports = class DrawCanvas {

  constructor(canvasDOM, options){

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

    this.init();
    this.setOptions(options);
    this.canvas.addEventListener('mousedown', this.ev_canvas.bind(this), false);
    this.canvas.addEventListener('mousemove', this.ev_canvas.bind(this), false);
    this.canvas.addEventListener('mouseup', this.ev_canvas.bind(this), false);
    this.canvas.addEventListener('mouseout', this.ev_canvas.bind(this), false);
  }

  setOptions(options){

    this.context.strokeStyle = Util.rgb2hex(Util.getStyleProp(this.canvas, 'color'));
    this.context.lineWidth = 5;
    this.period = 10;
    this.onFinishLine = null;
    this.onClear = null;
    this.onUndo = null;

    if(typeof options !== 'object' || options == null) return;

    if(typeof options.color === 'string')
      this.context.strokeStyle = options.color;

    if(typeof options.lineWidth === 'number')
      this.context.lineWidth = options.lineWidth;

    if(typeof options.period === 'number')
      this.period = options.period;

    if(typeof options.onFinishLine === 'function')
      this.onFinishLine = options.onFinishLine;

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
    this.temp = [];
    this.lines = [];
    this.firstTimestamp = -1;
  }

  ev_canvas(ev) {
    if (this.getX(ev) || this.getX(ev) == 0) {
      ev._x = this.getX(ev);
      ev._y = this.getY(ev);
    }

    ev._x = ev._x + 0.5;
    var func = this[ev.type].bind(this);
    if (func)
      func(ev);
  }

  addDot(point){

    let time = 0;

    if(this.temp.length == 0 && this.lines.length == 0){
      time = 0;
      this.firstTimestamp = new Date().getTime();
    } else {
      time = new Date().getTime() - this.firstTimestamp;
    }

    point.timestamp = time;
    this.temp.push(point);
  }


  finishLine(){
    var canvasCopy = document.createElement('canvas');
    canvasCopy.width = this.canvas.offsetWidth;
    canvasCopy.height = this.canvas.offsetHeight;
    var canvasCopyCtx = canvasCopy.getContext('2d');
    canvasCopyCtx.drawImage(this.canvas, 0, 0);
    this.undoHistory.push(canvasCopy);
    this.lines.push(this.temp);
    this.temp = [];
    if(this.onFinishLine != null)
      this.onFinishLine(this);
  }

  getX(ev){
    return ev.offsetX;
  }

  getY(ev){
    return ev.offsetY;
  }

  mousedown(ev) {
    this.count = 0;
    var point = {
        x: ev._x / this.canvas.offsetWidth,
        y: ev._y / this.canvas.offsetWidth
    };
    this.addDot(point);
    this.drawDot(this.context, point.x, point.y);
    this.memCtx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.memCtx.drawImage(this.canvas, 0, 0);
    this.points.push(point);
    this.started = true;

    this.drawPoints(this.context, this.points);
  }

  mousemove(ev) {
    if (this.started) {
      var point = {
          x: ev._x / this.canvas.offsetWidth,
          y: ev._y / this.canvas.offsetWidth
      };

        this.count++;
        if(this.count == this.period){
          this.addDot(point);
          this.count = 0;
        }
        this.context.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.context.drawImage(this.memCanvas, 0, 0);
        this.points.push(point);
        this.drawPoints(this.context, this.points);
    }
  }

  mouseup(ev) {
    if (this.started) {
        this.started = false;
        this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.memCtx.drawImage(this.canvas, 0, 0);
        this.points = [];

        var point = {
            x: ev._x / this.canvas.offsetWidth,
            y: ev._y / this.canvas.offsetWidth
        };

        this.addDot(point);
        this.finishLine();
    }
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


  drawDot(ctx, x, y){
    ctx.beginPath();
    ctx.arc(x * this.canvas.width, y * this.canvas.width, ctx.lineWidth/2, 0, 2 * Math.PI, false);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }

  drawPoints(ctx, points) {
    ctx.beginPath();

    ctx.moveTo(points[0].x * this.canvas.width, points[0].y * this.canvas.width);
    for (var i = 1; i < points.length - 2; i++) {
        var c = ((points[i].x* this.canvas.width) + (points[i + 1].x* this.canvas.width)) / 2,
            d = ((points[i].y * this.canvas.width) + (points[i + 1].y * this.canvas.width)) / 2;
        ctx.quadraticCurveTo(points[i].x * this.canvas.width, points[i].y * this.canvas.width, c, d);
    }
    if(i < points.length - 1){
      ctx.quadraticCurveTo(
        points[i].x * this.canvas.width,
        points[i].y * this.canvas.width,
        points[i + 1].x * this.canvas.width,
        points[i + 1].y * this.canvas.width);
    }
    ctx.stroke();
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


class Drawer {




}

module.exports = Drawer;


/***/ })
/******/ ]);