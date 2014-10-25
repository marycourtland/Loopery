num_canvas_objects = 1;
function GameObject(game, params) {
  if (params == null) params = {};
  
  this.id = params.id? params.id : 'obj' + (num_canvas_objects-1).toString();
  num_canvas_objects+=1;
  this.kind ="object";
  this.reset = function() {};
  
  // The tick method
  this.tick = function() {
    for (var i = 0; i < this.tickActions.length; i++) {
      this.tickActions[i].call(this);
    }
  };
  this.tickActions = [];
  
  // The draw method
  this.draw = function() {
    for (var i = 0; i < this.drawActions.length; i++) {
      this.drawActions[i].call(this);
    }
  };
  this.drawActions = [];
  
  // Position and graphics-related settings
  this.ctx = game.ctx;
  this.pos = params.pos? params.pos : xy(0, 0);
  this.dir = 0; // in radians
  this.graphics = {
    color: "gray",
    lineWidth: 2,
    images: []
  };
  this.getPos = function() {
    return this.pos;
  };
  this.setPos = function(pos) {
    this.pos._set_xy(pos.x, pos.y);
  }
  this.placeAt = function(pos) { this.setPos(pos); } // alias
  this.replacePos = function(pos) {
    this.pos = pos;
  }
  this.contains = function(p) {
    return false;
  };
  this.move = function(delta) {
    this.pos.add(delta);
  };
  this.setImage = function(image_url, params) {
    if (params == null) params = {}
    var image = loadImage(this.ctx, image_url);
    image.offset = params.offset ? params.offset : xy(0, 0);
    if (params.rotate) image.rotate = true;
    this.graphics.images.push(image);
  }
  this.drawActions.push(function() {
    for (var i = 0; i < this.graphics.images.length; i++) {
      img = this.graphics.images[i];
      offset = img.offset? img.offset : xy(0, 0);
      offset = add(offset, xy(-img.width/2, -img.height/2)); // By default, position the image's center at the pos
      if (img.rotate) {
        this.ctx.save();
        this.ctx.translate(this.pos.x, this.pos.y);
        this.ctx.rotate(this.dir);
        this.ctx.translate(-this.pos.x, -this.pos.y);
        this.ctx.drawImage(img, round(this.pos.x + offset.x, 0), round(this.pos.y + offset.y, 0));
        //this.ctx.rotate(-this.dir);
        this.ctx.restore();
      }
      else { 
        this.ctx.drawImage(img, round(this.pos.x + offset.x, 0), round(this.pos.y + offset.y, 0));
      }
    }
  })
  
  // Input events
  this.onclick = function(evt) {};
  this.ondrag = function(evt) {};
  this.onmousedown = function(evt) {};
  this.onmouseup = function(evt) {};
  
  // This method simply removes it from global arrays. It does not use the delete keyword
  this.destroy = function() {
    // Remove it from the game.objects array
    for (var obj = 0; obj < game.objects.length; obj++) {
      if (game.objects[obj] === this) {
        game.objects.splice(obj, 1);
        break;
      }
    }
    
    // Remove it from the game.ctx.canvas.objects array
    for (var obj = 0; obj < game.ctx.canvas.objects.length; obj++) {
      if (game.ctx.canvas.objects[obj] === this) {
        game.ctx.canvas.objects.splice(obj, 1);
        break;
      }
    }
    
    // Also, set this flag
    this.destroyed = true;
  }
  game.objects.push(this);
  
  if (!game.ctx.canvas.objects) game.ctx.canvas.objects = [];
  game.ctx.canvas.objects.push(this);
}


//////////////////////////////////////////////////////////////
// Functions to give objects certain features

// Drawing-related
function configImages(obj, images) {
  obj.graphics.images = images;
  obj.drawActions.push(function() {
    for (var i=0; i < this.images.length; i++) {
      img = this.images[i];
      offset = img.offset ? img.offset : xy(0, 0);
      this.ctx.drawImage(img, round(this.pos.x + offset.x, 0), round(this.pos.y + offset.y, 0));
    }
  });
  return obj
}

function configShape(obj, points) {
  obj.points = points; 
  obj.getPoint = function(i) {
    if (i >= this.points.length) {
      throw "out of bounds: " + i + " > " + this.points.length-1;
    }
    return add(this.points[i], this.pos);
  },
  obj.pushPoint = function(pos, i) { // Given point should be in the external reference frame
    if (i == null) i = this.points.length;
    this.points.splice(i, 0, subtract(pos, this.pos));
    
  };
  obj.clearPoints = function() {
    this.points = [];
  }
  
  // Geometrical functions
  // This executes code on each pair of adjacent points.
  // Given function should take 2 points.
  // NOTE: currently, it ignores bezier points.
  obj.forEachPointPair = function(func) {
    for (var i=1; i < this.points.length; i++) {
      if (isArray(this.points[i])) continue;
      func.call(this, this.getPoint(i-1), this.getPoint(i));
    }
    func.call(this, this.getPoint(this.points.length-1), this.getPoint(0));
  };
  obj.getTriangulation = function() {
    this._triangles = [];
    this.forEachPointPair(function(p1, p2) {
      // Triangle goes from the centerpoint to p1 to p2
      this._triangles.push([this.pos, p1, p2]);
    });
    var triangles = this._triangles;
    this._triangles = null;
    return triangles;
  };
  obj.computeTriangleCOM = function(triangle_corners) {
    // A triangle's COM is the average of its corners' coordinates
    return xy(
      (triangle_corners[0].x + triangle_corners[1].x + triangle_corners[2].x) / 3,
      (triangle_corners[0].y + triangle_corners[1].y + triangle_corners[2].y) / 3
    );
  },
  obj.computeTriangleArea = function(triangle_corners) {
    // A triangle's area is half the cross product of two of its sides
    var v1 = subtract(triangle_corners[1], triangle_corners[0]);
    var v2 = subtract(triangle_corners[2], triangle_corners[0]);
    //return (v1.x * v2.y + v2.x * v1.y) / 2;
    return Math.abs(cross_mag(v1, v2) / 2);
  };
  obj.computeCOM = function() {
    // Find the COM of each triangular component, and weight it by its area
    var triangles = this.getTriangulation();
    var weighted_coms = [];
    var area = 0;
    for (var i=0; i < triangles.length; i++) {
      var a = Math.abs(this.computeTriangleArea(triangles[i]));
      area += a;
      weighted_coms.push(scale(this.computeTriangleCOM(triangles[i]), a));
    }
    
    // Compute the average coordinates of all the weighted triangle COMs
    var com = xy(0, 0);
    for (var i=0; i < triangles.length; i++) com.add(weighted_coms[i]);
    com.scale(1 / (area));
    return com;
  },
  obj.computeArea = function() {
    var triangles = this.getTriangulation();
    var area = 0;
    for (var i=0; i < triangles.length; i++) area += this.computeTriangleArea(triangles[i]);
    return area;
  },
  
  obj.contains = function(p) {
    if (this.points.length < 2) return false;
    angle = 0;
    angles = [];
    anglepoints = {};
    for (var i=0; i < this.points.length; i++) {
      angles.push(mod(this.points[i].th, 360));
      anglepoints[mod(this.points[i].th, 360)] = this.points[i];
    }
    angles.sort(function(a1, a2){ return a1 - a2; });
    var a1 = 0;
    var a2 = 0;
    var ap = mod(subtract(p, this.pos).th, 360);
    for (var i=1; i < this.points.length; i++) {
      a1 = angles[i-1];
      a2 = angles[i];
      if (a2-a1 > Math.PI) return false;
      if (ap >= a1 && ap < a2) break;
      else { a1 = angles[angles.length - 1]; a2 = angles[0]; }
    }
    var v1 = neg(anglepoints[a1]);
    var v2 = add(anglepoints[a2], v1);
    var vp = add(subtract(p, this.pos), v1);
    return v2.th <= vp.th && vp.th < v1.th;
  }
  
    // Draw the object on the canvas
  obj.drawActions.push(function() {
    if (this.points.length < 1) return;
    this.pos.add(xy(0.5, 0.5));
    this.ctx.save();
    this.ctx.lineWidth = this.graphics.lineWidth != null? this.graphics.lineWidth : 1;
    this.ctx.globalAlpha = this.graphics.alpha != null? this.graphics.alpha : 1;
    this.ctx.strokeStyle = this.graphics.color;
    this.ctx.fillStyle = this.graphics.outline_color? this.graphics.outline_color : this.graphics.color;
    this.ctx.beginPath();
    this.ctx.moveTo(this.pos.x+this.points[0].x, this.pos.y+this.points[0].y);
    var c0 = null;
    var c1 = null;
    for (var i=1; i < this.points.length; i++) {
      if (!this.points[i].length) {
        if (c0 && c1) {
          this.ctx.bezierCurveTo(this.pos.x+c0.x, this.pos.y+c0.y,
                            this.pos.x+c1.x, this.pos.y+c1.y,
                            this.pos.x+this.points[i].x, this.pos.y+this.points[i].y);
          //console.log("bz curve to " + this.points[i]);
        }
        else {
          //console.log("line to " + this.points[i])
          this.ctx.lineTo(this.pos.x+this.points[i].x, this.pos.y+this.points[i].y);
        }
        c0 = null;
        c1 = null;
      }
      else {
        //console.log("bz controls:  " + this.points[i][0] + " " + this.points[i][1]);
        c0 = this.points[i][0];
        c1 = this.points[i][1];
      }
          
    }
    this.ctx.lineTo(this.pos.x+this.points[0].x, this.pos.y+this.points[0].y);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
    this.pos.subtract(xy(0.5, 0.5));
    this.ctx.restore();
    marker(this.ctx, this.computeCOM(), 'black');
  });
}

// Motion-related
function actuate(obj) { // Allow it to move & obey forces
  // todo: add mass or something (or include it in the vector field)
  obj.kind = "dynamic_" + obj.kind;
  obj.is_dynamic = true;
  obj.velocity = xy(0, 0);
  obj.frozen = false;
  obj.forces = {};
  
  obj.getVelocity = function() { return this.velocity; }
  
  obj.tickActions.push(function() {
    if (this.frozen) return;
    for (i in this.forces) {
      if (!this.forces[i]) continue;
      type = this.forces[i].type;
      
      if (type.length >= 4 && type.slice(0, 4) == 'temp') {
        this.forces[i].countdown -= 0;
        if (this.forces[i].countdown < 0) continue;
        type = type.replace('temp ', '');
      }
      
      if (type == 'effect') {
        this.forces[i].at(this);
      }
      else if (type == 'acceleration') {
        this.velocity.add(this.forces[i].at(this));
      }
      else if (type == 'velocity') {
        this.move(this.forces[i].at(this));
      }
    }
  })
  
  obj.tickActions.push(function() {
    if (this.frozen) return;
    this.move(this.velocity);
  })
  
  obj.tickActions.push(function() {
    if (this.velocity.r > 0) this.dir = this.velocity.th;
  });
  
  obj.obey = function(id, vectorfield) { this.forces[id] = vectorfield;}
  obj.ignore = function(id) { if (!(id in this.forces)) return; delete this.forces[id];}
  
  obj.freeze = function(){ this.frozen = true; }
  obj.unfreeze = function(){ this.frozen = false; }
  
  return obj;
}
function handle(obj) {  // Allow the user to click & drag it
  obj.is_handled = true;
  obj.kind = "draggable_" + obj.kind;
  obj.onmousedown = function() {
    if (this.is_dynamic) this.freeze();
  }
  obj.ondrag = function() {
    this.move(mouse.velocity);
  }
  obj.onmouseup = function() {
    if(this.is_dynamic) {
      this.unfreeze();
    }
  }
  return obj;
}
function launch(obj) {  // Allow the user to "throw" it with the mouse
  obj.kind = "launchable_" + obj.kind;
  if (!obj.is_handled) handle(obj);
  obj.is_launchable = true;
  obj.onmouseup = function() {
    if(this.is_dynamic) {
      this.velocity.add(mouse.velocity);
      this.unfreeze();
    }
  }
  return obj;
}
function solidify(obj) {
  obj.kind = "solid_" + obj.kind;
  obj.is_solid = true;
  obj.colliders = [];
  obj.checkCollision = function(obj2) {
    var colliding_point_indices = [];
    for (var i=0; i < this.points.length; i++) {
      if (isArray(this.points[i])) continue; // For now, ignore bezier control points
      if (obj2.contains(this.getPoint(i))) colliding_point_indices.push(i); // return the INDEX of the point which is colliding w/ the object
    }
    return colliding_point_indices;
  }
  obj.tickActions.push(function() {
    for (var i=0; i < this.colliders.length; i++) {
      var obj = this.colliders[i];
      var colliding_pt_indices = this.checkCollision(obj);
      for (var i=0; i < colliding_pt_indices.length; i++) {
        var pt_index = colliding_pt_indices[i];
        
        // find which edge got crossed
        var edge1 = obj.getCrossedEdge(this.getPoint(pt_index), this.getPoint(mod(pt_index - 1, this.points.length)));
        var edge2 = obj.getCrossedEdge(this.getPoint(pt_index), this.getPoint(mod(pt_index + 1, this.points.length)));
        
        // Designate points for test-marking
        var markerpts = [];
        markerpts.push(this.getPoint(pt_index));
        test_markers_big.push(this.getPoint(pt_index));
        if (edge1) {
          markerpts.push(edge1[0]);
          markerpts.push(edge1[1]);
        }
        if (edge2) {
          markerpts.push(edge2[0]);
          markerpts.push(edge1[1]);
        }
        test_markers.push(markerpts);
        
        //if (game.frame%100==0) console.log(this.id + " at " + this.getPoint(colliding_pt_index) + ": crossed edge: " + edge1 + " and " + edge2);;
      }
    }
  })
}
function collide(obj1, obj2) {
  if (obj1.is_solid) obj1.colliders.push(obj2);
  if (obj2.is_solid) obj2.colliders.push(obj1);
}

// Allow the user to move it around w/ keys
function navigate(obj, keydirs, nav_speed, freeze) {  
  obj.kind = "navigated_" + obj.kind;
  obj.is_navigated = true;
  obj.navigation = [];
  if (nav_speed == null) obj.nav_speed = 3;
  else obj.nav_speed = nav_speed;
  obj.tickActions.push(function() {
    if (this.navigation.length == 0) return;
    dx = xy(0, 0);
    for (var i=0; i < this.navigation.length; i++) {
      if (this.navigation[i] == 'left') dx.add(xy(-1, 0));
      if (this.navigation[i] == 'right') dx.add(xy(1, 0));
      if (this.navigation[i] == 'up') dx.add(xy(0, -1));
      if (this.navigation[i] == 'down') dx.add(xy(0, 1));
    }
    dx.normalize(this.nav_speed);
    this.move(dx);
    this.dir = dx.th;
  });
  
  window.addEventListener("keydown", function(event) {
    key = getKeyFromEvent(event);
    if (key in keydirs) {
      for (var i=0; i < obj.navigation.length; i++) {
        if (obj.navigation[i] == keydirs[key]) return;
      }
      obj.navigation.push(keydirs[key]);
      if (obj.is_dynamic && freeze) obj.freeze();
    }
  }, false);
  window.addEventListener("keyup", function(event) {
    key = getKeyFromEvent(event);
    if (obj.navigation.indexOf(keydirs[key]) != -1)
      obj.navigation.splice(obj.navigation.indexOf(keydirs[key]), 1);
    if (obj.navigation.length == 0 && obj.unfreeze) obj.unfreeze();
  });
  return obj;
}
function navigateDiscrete(obj, keydirs, speed, freeze) {  
  obj.kind = "navigated_" + obj.kind;
  obj.is_navigated = true;
  obj.navigation = [];
  if (speed == null) obj.speed = 3;
  else obj.speed = speed;
  obj.tickActions.push(function() {
    if (this.navigation.length == 0) return;
    dx = xy(0, 0);
    for (var i=0; i < this.navigation.length; i++) {
      if (this.navigation[i] == 'left') dx.add(xy(-1, 0));
      if (this.navigation[i] == 'right') dx.add(xy(1, 0));
      if (this.navigation[i] == 'up') dx.add(xy(0, -1));
      if (this.navigation[i] == 'down') dx.add(xy(0, 1));
    }
    dx.normalize(this.speed);
    obj.move(dx);
  });
  window.addEventListener("keydown", function(event) {
    key = getKeyFromEvent(event);
    if (key in keydirs) key = keydirs[key];
    if (key == 'left') obj.move(xy(-block_size.x, 0));
    if (key == 'right') obj.move(xy(block_size.x, 0));
    if (key == 'up') obj.move(xy(0, -block_size.y));
    if (key == 'down') obj.move(xy(0, block_size.y));
  });
  return obj;
}
function point(obj) {
  // TODO
}

// Game-related
function character(obj) {
  if (obj.kind.indexOf("object") != -1) {
    obj.kind = obj.kind.replace("object", "character");
  }
  else obj.kind = obj.kind + "_character";
  obj.inventory = [];
  obj.holds = function(item, offset) {
    if (offset == null) offset = xy(-20, 0);
    item.hold_offset = offset;
    item.ignore('held');
    item.obey('held', heldBy(obj, offset));
    this.inventory.push(item);
  }
  obj.drops = function(item, relocation) {
    if (this.inventory.indexOf(item) == -1) return;
    item.ignore('held');
    this.inventory.splice(this.inventory.indexOf(item), 1);
    if (relocation != null) {
      item.move(relocation);
    }
  }
  obj.switchHands = function() {
    if (this.inventory.length == 0) return;
    this.inventory[0].hold_offset.xreflect();
    this.inventory[0].ignore('held');
    this.inventory[0].obey('held', heldBy(obj, this.inventory[0].hold_offset));
  }
  
  obj.comment = null;
  obj.commentOffset = null;
  obj.say = function(txt, offset) {
    duration = 4; // number of seconds to keep the text lingering
    obj.comment = txt;
    obj.comment_offset = offset? offset : xy(5, -35);
    _thisobj = this;
    setTimeout(function() { _thisobj.comment = null; }, duration*1000);
  }
  obj.drawActions.push(function() {
    if (obj.comment != null) {
      draw.text(obj.ctx, obj.comment, add(obj.pos, obj.comment_offset), 'sw');
    }
  });
  return obj
}

// Other
function bindClick(obj, callback) {
  obj.onclick = callback;
  return obj
}
function bindKey(obj, key, callback) {
  window.addEventListener("keypress", function(event) {
    if (getKeyFromEvent(event) == key) callback(event);
  });
  return obj;
}
