describe("Util", function() {
  var Util = require('../../src/util');

  describe("RGB to #rrggbb converter", function(){

    it("should convert RGB to #rrggbb correctly", function() {
      expect(Util.rgb2hex('rgb(255, 255, 255)')).toEqual('#ffffff');
      expect(Util.rgb2hex('rgb(255, 1, 1)')).toEqual('#ff0101');
      expect(Util.rgb2hex('rgb(10, 10, 10)')).toEqual('#0a0a0a');
      expect(Util.rgb2hex('rgb(0, 255, 7)')).toEqual('#00ff07');
    });

    it("should work with extra spaces (or no spaces)", function() {
      expect(Util.rgb2hex('rgb(255,255, 255)')).toEqual('#ffffff');
      expect(Util.rgb2hex('rgb(255, 1,1)')).toEqual('#ff0101');
      expect(Util.rgb2hex('rgb(10,10, 10)')).toEqual('#0a0a0a');
      expect(Util.rgb2hex('rgb(0, 255,7)')).toEqual('#00ff07');
    });

    it("should return BLACK (#000000) if the regex doesn't match", function() {
      expect(Util.rgb2hex('rgb(255,s255, 255)')).toEqual('#000000');
      expect(Util.rgb2hex('rgsb(255, 1,1)')).toEqual('#000000');
      expect(Util.rgb2hex('rgb(10,10, 10')).toEqual('#000000');
      expect(Util.rgb2hex(' rgb(0, 255,7)')).toEqual('#000000');
    });
  });
});
