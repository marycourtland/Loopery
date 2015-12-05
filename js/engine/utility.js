function logf() {
    stack = []
    func = arguments.callee.caller
    stackstring = func.name
    indent = ""
    while (func && stack.length<10) {
        stack.push(func)
        func = stack[stack.length-1].arguments.callee.caller
        if (func) {
            stackstring = func.name + " > " + stackstring
            indent += "    "
        }
    }
    console.log("[-logf-]", stackstring, stack[0].arguments);
}
function loadImage(ctx, src, pos) {
    var img = new Image();
    if (pos) img.onload = function() { ctx.drawImage(img, pos.x, pos.y); }
    img.src = src;
    return img
}
function getXML(xmlfile) {
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  }
  else { // ie5, ie6
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET", xmlfile, false);
  xmlhttp.send();
  return xmlhttp.responseXML;
}
function iter(array, callback) {
    if (!callback || !array || !array.length) return;
    for (var i=0; i < array.length; i++) {
        callback(array[i]);
    }
}
function isArray(a) {
  return Object.prototype.toString.apply(a) === '[object Array]';
}
function isInArray(item, a) {
  return a.indexOf(item) != -1;
}
function removeFromArray(index, a) {
  return a.splice(index, 1)[0];
}
function flatten(a) {
  var new_array = [];
  for (var i=0; i < a.length; i++) {
    if (isArray(a[i])) new_array = new_array.concat(a[i]);
    else new_array.push(a[i]);
  }
  return new_array;
}
function hw() {
    console.log("Hello world");
}
function isInArea(pos, area_pos, area_size) {
  // Assumes that area_size is nonzero
  return !(
    (pos.x < area_pos.x)
  || (pos.y < area_pos.y)
  || (pos.x > area_pos.x + area_size.x)
  || (pos.y > area_pos.y + area_size.y)
  );
}
function isBetweenCoords(pos, p1, p2) {
  // Assumes that p1 < p2
  // (i.e. p1 is the NW corner of the box, and p2 is the NE corner)
  return !(
    (pos.x < p1.x)
  || (pos.y < p1.y)
  || (pos.x > p2.x)
  || (pos.y > p2.y)
  )
}
function boxcoords(size) {
    var r = size/2;
    return [xy(-r, -r), xy(r, -r), xy(r, r), xy(-r, r)];
}
function drawGrid(ctx, grid) {
    // The grid object should be something like:
    // grid = {color: "gray", x:20, y:20, X:5, Y:5};
    if (!grid.dash) grid.dash = 1;
    if (!grid.color) grid.color = "gray";
    
    ctx.strokeStyle = grid.color;
    ctx.lineWidth = 1;
    
    var W = ctx.canvas.width;
    var H = ctx.canvas.height;
    
    var dx = xy(grid.x, 0);
    var dy = xy(0, grid.y);
    
    // Horizontal grid lines
    var p0 = xy(0, 0.5);
    var p1 = xy(W, 0.5);
    var i = 0;
    while (p0.y <= H) {
        // Minor grid lines
        if (grid.X && i % grid.X != 0) {
            p1.x = grid.dash;
            while(p1.x <= W) {
                draw.line(ctx, p0, p1);
                p0.add({x:grid.dash*2, y:0});
                p1.add({x:grid.dash*2, y:0});
            }
            p0.x = 0;
            p1.x = W;
        }
        // Major grid lines
        else {
            draw.line(ctx, p0, p1);
        }
        p0.add({x:0, y:grid.y});
        p1.add({x:0, y:grid.y});
        i++;
    }
    // Vertical grid lines
    p0 = xy(0.5, 0);
    p1 = xy(0.5, H);
    i = 0;
    while (p0.x <= W) {
        // Minor grid lines
        if (grid.Y && i % grid.Y != 0) {
            p1.y = grid.dash;
            while(p1.y <= H) {
                draw.line(ctx, p0, p1);
                p0.add({x:0, y:grid.dash*2});
                p1.add({x:0, y:grid.dash*2});
            }
            p0.y = 0;
            p1.y = H;
        }
        // Major grid lines
        else {
            draw.line(ctx, p0, p1);
        }
        p0.add({x:grid.x, y:0});
        p1.add({x:grid.x, y:0});
        i++;
    }
    
}
function getTimeSince(t0) {
  return new Date().getTime() - t0;
}
function isTypeOf(obj, type) {
  // Type should be the instantiating function 
  var test = new type(); // not sure what to do if this throws argument errors
  return obj.__proto__ == test.__proto__;
}
