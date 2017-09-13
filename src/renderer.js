'use strict';

class Renderer {

  constructor(canvas){
    this.canvasWidth = canvas.width;
  }

  drawPoints(ctx, points) {
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
