// Requires math2D.js

function rgb(r, g, b) {
  return {
    r: r,
    g: g,
    b: b,
    toHSL: function() {
      // adapted from the algorithm detailed at:
      // http://www.cs.rit.edu/~ncs/color/t_convert.html#RGB%20to%20HSV%20&%20HSV%20to%20RGB 
      
      // First convert to HSV
      var h = null;
      var s = null;
      var v = null;
      
      var min = Math.min(this.r, this.g, this.b);
      var max = Math.max(this.r, this.g, this.b);
      var v = max;
      var delta = max - min;
      
      if (max != 0) s = delta / max;
      else {
        // all coordinates are 0
        s = 0;
        h = -1;
        return hsl(h, s, l);
      }
      
      if (max == r)
        h = (g - b) / delta;     // between yellow and magenta
      else if (max == g)
        h = 2 + (b - r) / delta; // between cyan and yellow
      else
        h = 4 + (r - g) / delta; // between magenta and cyan
      
      h = mod(h*60, 360);
      v /= 255;
      
      // Now, convert to HSL 
      var l = (2 - s) * v;
      s *= v;
      s /= (l <= 1)? l : 2 - l;
      l /= 2;
      
      return hsl(h, s, l);
    },
    toString: function() { return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")"}
  }
}
function hsl(h, s, l) {
  return {
    h: h,
    s: s,
    l: l,
    toString: function() { return "hsl(" + this.h + ", " + this.s*100 + "%, " + this.l*100 + "%)"}
  }
}

function randomColor() {
  rgb = Math.floor(Math.random() * Math.pow(256, 3)).toString(16);
  return '#' + rgb
}

// Color difference functions
function colorDiff(c1, c2) { 
  if ((c1+"")[0]=='r') c1 = c1.toHSL();
  if ((c2+"")[0]=='r') c2 = c2.toHSL();
  if ((c1.l > 0.9 && c2.l > 0.9) || (c1.l < 0.1 && c2.l < 0.1)) return 0;
  return Math.sqrt(Math.pow(100*(c2.s - c1.s), 2) + Math.pow(100*(c2.l - c1.l), 2));
}
function hueColorDiff(c1, c2) { // this function only compares the two colors based on their hue values
  if ((c1+"")[0]=='r') c1 = c1.toHSL();
  if ((c2+"")[0]=='r') c2 = c2.toHSL();
  d1 = Math.abs(c2.h - c1.h);
  d2 = ((360-Math.max(c2.h, c1.h)) + Math.min(c2.h, c1.h));
  console.log("---");
  console.log("hue diff:", Math.min(d1, d2)); 
  console.log("sat factor:", Math.abs(c2.s - c1.s));
  console.log("result:", Math.min(d1, d2)*Math.abs(c2.s - c1.s));
  console.log("--");
  return Math.min(d1, d2)*Math.abs(c2.s - c1.s);
  
}
function totalColorDiff(c1, c2) { // this function considers all 3 coords: hue, saturation, lightness
  if ((c1+"")[0]=='r') c1 = c1.toHSL();
  if ((c2+"")[0]=='r') c2 = c2.toHSL();
  return Math.sqrt(Math.pow((c2.h - c1.h), 2) + Math.pow(100*(c2.s - c1.s), 2) + Math.pow(100*(c2.l - c1.l), 2))
}
