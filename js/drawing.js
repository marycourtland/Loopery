// Requires math2D.js

function clear(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
function line(ctx, p0, p1, color, linewidth) {
  ctx.save();
  ctx.lineWidth = linewidth || 1;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
function rect(ctx, p0, p1, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.rect(p0.x+0.5, p0.y+0.5, p1.x-p0.x, p1.y-p0.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function rect_rounded(ctx, p0, p1, corner_radius, color) {
  var r = corner_radius;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(p0.x + r, p0.y);
  ctx.lineTo(p1.x - r, p0.y)
  ctx.arcTo(p1.x, p0.y, p1.x, p0.y + r, r);
  ctx.lineTo(p1.x, p1.y - r);
  ctx.arcTo(p1.x, p1.y, p1.x - r, p1.y, r);
  ctx.lineTo(p0.x + r, p1.y);
  ctx.arcTo(p0.x, p1.y, p0.x, p1.y - r, r);
  ctx.lineTo(p0.x, p0.y + r);
  ctx.arcTo(p0.x, p0.y, p0.x + r, p0.y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function circle(ctx, center, radius, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function setCircle(ctx, center, radius, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 0.4;
  ctx.fill();
  ctx.restore();
}
function emptyCircle(ctx, center, radius, color, linewidth) {
  ctx.save();
  //ctx.globalCompositeOperation = "xor";
  ctx.strokeStyle = color;
  ctx.lineWidth = (linewidth || 1);
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
function bezier(ctx, p0, p1, c0, c1, show_controls) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(c0.x, c0.y, c1.x, c1.y, p1.x, p1.y);
  ctx.closePath();
  ctx.stroke();
  if (show_controls) {
    marker(ctx, c0.x, c0.y);
    marker(ctx, c1.x, c1.y);
  }
  ctx.restore();
}
function text(ctx, txt, pos, pos_loc, color) {
  // Valid values for pos_loc:
  //  "centered"  => the given pos will be in the center of the text
  //  "nw"        => the given pos will be on the NW corner of the text
  //  "ne"        => the given pos will be on the NE corner of the text
  //  "se"        => the given pos will be on the SE corner of the text
  //  "sw"        => the given pos will be on the SW corner of the text
  //  Anything else: same as "sw"
  if (color == null) color = 'black';
  
  if (!isArray(txt)) txt = [txt];
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (pos != "center") pos = pos.copy();
  
  if (pos == "center")
    pos = xy(ctx.canvas.width/2 - ctx.measureText(txt).width/2, ctx.canvas.height/2 + ctx.fontsize/2);
  else if (!pos_loc || pos_loc.toLowerCase()=="nw")
    pos.add(xy(0, ctx.fontsize));
  else if (pos_loc.toLowerCase()=="ne")
    pos.add(xy(-ctx.measureText(txt).width, ctx.fontsize));
  else if (pos_loc.toLowerCase()=="se")
    pos.add(xy(ctx.measureText(txt).width, 0));
  else if (pos_loc.toLowerCase()=="centered")
    pos.add(xy(-ctx.measureText(txt).width/2, ctx.fontsize/2));
  
  for (var i=0; i < txt.length; i++) {
    if (typeof(txt[i]) != "string") continue;
    ctx.fillText(txt[i], pos.x, pos.y);
    pos.add(xy(0, ctx.fontsize));
  }
  ctx.restore();
}
function marker(ctx, pos, color, size) {
  if (color) { ctx.strokeStyle = color; ctx.fillStyle = color;}
  if (!size) size = 2;
  circle(ctx, pos, size);
}

// This requires colors.js
function getPixel(ctx, pos) {
  pos = vround(pos);
  var imd = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  var index = 4 * ((pos.y * ctx.canvas.width) + pos.x);
  var rgba = [];
  for (var i=0; i<4; i++) rgba.push(imd.data[index + i]);
  return rgb(rgba[0], rgba[1], rgba[2]);
}
