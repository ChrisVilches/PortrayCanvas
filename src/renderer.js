'use strict';

class Renderer {

  constructor(canvas){
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
  }

  drawPoints(ctx, points) {

    if(points.length == 2){
      ctx.beginPath();
      ctx.moveTo(points[0].x * this.canvasWidth, points[0].y * this.canvasHeight);
      ctx.lineTo(points[1].x * this.canvasWidth, points[1].y * this.canvasHeight);
      ctx.stroke();
      return;
    }

    ctx.beginPath();

    ctx.moveTo(points[0].x * this.canvasWidth, points[0].y * this.canvasHeight);
    for (var i = 1; i < points.length - 2; i++) {
        var c = ((points[i].x* this.canvasWidth) + (points[i + 1].x* this.canvasWidth)) / 2,
            d = ((points[i].y * this.canvasHeight) + (points[i + 1].y * this.canvasHeight)) / 2;
        ctx.quadraticCurveTo(points[i].x * this.canvasWidth, points[i].y * this.canvasHeight, c, d);
    }
    if(i < points.length - 1){
      ctx.quadraticCurveTo(
        points[i].x * this.canvasWidth,
        points[i].y * this.canvasHeight,
        points[i + 1].x * this.canvasWidth,
        points[i + 1].y * this.canvasHeight);
    }
    ctx.stroke();
  }

  drawDot(ctx, x, y){
    ctx.beginPath();
    ctx.arc(x * this.canvasWidth, y * this.canvasHeight, ctx.lineWidth/2, 0, 2 * Math.PI, false);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }
}

module.exports = Renderer;
