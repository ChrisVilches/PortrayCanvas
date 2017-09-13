'use strict';

var Util = require('./util.js');
var Drawer = require('./drawer.js');

module.exports = class DrawCanvas {

  constructor(canvasDOM, options){

    this.canvas = canvasDOM;
    this.started = false;
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
    this.drawer.drawDot(this.context, point.x, point.y);
    this.memCtx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.memCtx.drawImage(this.canvas, 0, 0);
    this.points.push(point);
    this.started = true;

    this.drawer.drawPoints(this.context, this.points);
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
        this.drawer.drawPoints(this.context, this.points);
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






}
