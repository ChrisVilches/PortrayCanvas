'use strict';

class Drawer {

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


  drawDot(ctx, x, y){
    ctx.beginPath();
    ctx.arc(x * this.canvas.width, y * this.canvas.width, ctx.lineWidth/2, 0, 2 * Math.PI, false);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }


}

module.exports = Drawer;
