'use strict';

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
