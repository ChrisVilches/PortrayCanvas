'use strict';

var Util = require('./util.js');
var Renderer = require('./renderer.js');


module.exports = class PortrayCanvas {

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
    this.canvas.addEventListener('touchstart', this.eventCanvas.bind(this), false);
    this.canvas.addEventListener('touchend', this.eventCanvas.bind(this), false);
    this.canvas.addEventListener('touchmove', this.eventCanvas.bind(this), false);
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

    let point = {};

    if(ev.type.charAt(0) === 't'){
      // touch
      var touch = ev.touches[0];

      if(typeof touch === "undefined"){
        point = this.currPoint;
      } else {
        var rect = this.canvas.getBoundingClientRect();
        point.x = (touch.clientX - rect.left)/this.canvas.offsetWidth;
        point.y = (touch.clientY - rect.top)/this.canvas.offsetWidth;
      }

    } else {
      // mouse
      point.x = ev.offsetX / this.canvas.offsetWidth;
      point.y = ev.offsetY / this.canvas.offsetWidth;
    }

    this.currPoint = point;

    switch(ev.type){

      case 'mousedown': this.eventStart(point); break;
      case 'mousemove': this.eventMove(point); break;
      case 'mouseup': this.eventEnd(point); break;
      case 'touchstart': this.eventStart(point); break;
      case 'touchmove': this.eventMove(point); break;
      case 'touchend': this.eventEnd(point); break;

    }
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

  eventStart(point){
    this.count = 0;
    this.addDotToTempLine(point);
    this.renderer.drawDot(this.context, point.x, point.y);
    this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.memCtx.drawImage(this.canvas, 0, 0);
    this.points.push(point);
    this.started = true;
    this.renderer.drawPoints(this.context, this.points);
  }

  eventEnd(point){
    if(!this.started) return;
    this.started = false;
    this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.memCtx.drawImage(this.canvas, 0, 0);
    this.points = [];
    this.addDotToTempLine(point);
    this.lineFinish();
  }

  eventMove(point){
    if(!this.started) return;
    this.count++;
    if(this.count == this.period){
      this.addDotToTempLine(point);
      this.count = 0;
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.memCanvas, 0, 0);
    this.points.push(point);
    this.renderer.drawPoints(this.context, this.points);
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
