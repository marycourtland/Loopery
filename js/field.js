/* Vector field class (requires math2D.js)
  The at_func argument should take an object (e.g. a CanvasObject) and
  compute the vector at that object's position (obj.pos).
  
  Use field.at(obj) to get 
*/

function field(type, at_func) {
  if (arguments.length == 1) {
    at_func = type;
    type = 'effect';
  }
  return {
    at: at_func,
    type: type,
    display: function(ctx, spacing) {
      // Assumes that the canvas hasn't been translated
      pos = xy(0.5, 0.5);
      while (pos.y <= ctx.canvas.height) {
        while (pos.x <= ctx.canvas.width) {
          pos.marker(ctx);
          line(ctx, pos, add(pos, this.at(pos)));
          pos.xshift(spacing);
        }
        pos.yshift(spacing);
        pos.x = 0.5;
      }
    },

    // Only allow nonzero field values when the condition_func returns true
    condition: function(condition_func) {
      at_func = this.at; 
      this.at = function(obj) {
        if (!condition_func(obj)) return xy(0, 0);
        return at_func(obj);
      };
      return this;
    },
    bound: function(boundary_values) {
      // This puts a bounding box on the vector field.
      // Outside the bbox (or circular area), the field is zero.
      this.boundaries = boundary_values;
      if (this.boundaries.radius != null && this.boundaries.pos != null) {
        radius = this.boundaries.radius;
        pos = this.boundaries.pos;
        cond_func = function() {
          return (subtract(obj.pos, pos).r > radius)
        }
        }
      else {
        cond_func = function(obj) {
          return
            (this.boundaries.xmin == null || obj.pos.x > this.boundaries.xmin) &&
            (this.boundaries.xmax == null || obj.pos.x > this.boundaries.xmax) &&
            (this.boundaries.ymin == null || obj.pos.y > this.boundaries.ymin) &&
            (this.boundaries.ymax == null || obj.pos.y > this.boundaries.ymax)
        };
      }
      this.condition(cond_func);
      return this;
    },
  }
}

// Particular cases of vector fields

function field_constant(v) {                   // useful for standard earth-gravity
  vf = field('acceleration', null);
  vf.at = function(obj) { return v; }
  return vf;
}
function field_linear(v0, delta) {
  // v0 is the vield at the origin; delta is the constant difference
  vf = field(function(obj) { return add(v0, dot(obj.pos, delta)); });
  vf.type = 'acceleration';
  return vf;
}
function field_inverse_square(center, params) { // useful for planetary orbits
  params = params? params : {};
  params.scale = params.scale ? params.scale : 1;
  vf = field(function(obj) {
    dist = subtract(center, obj.pos);
    return rth(params.scale/(dist.r*dist.r), mod(dist.th, Math.PI*2));
    
  });
  vf.type = 'acceleration';
  return vf;
}

function reflecting_boundary(boundary_values) {
  vf = field('effect', null);
  vf.vals = boundary_values;
  vf.at = function(obj) {
    if (this.vals.xmin != null && obj.pos.x <= this.vals.xmin && obj.velocity.x < 0) obj.velocity.xreflect();
    if (this.vals.xmax != null && obj.pos.x >= this.vals.xmax && obj.velocity.x > 0) obj.velocity.xreflect();
    if (this.vals.ymin != null && obj.pos.y <= this.vals.ymin && obj.velocity.y < 0) obj.velocity.yreflect();
    if (this.vals.ymax != null && obj.pos.y >= this.vals.ymax && obj.velocity.y > 0) obj.velocity.yreflect();
  }
  return vf
}
function reflecting_surfaces(boundary_values) {
  var vf = field(function(obj) { return vzero; });
  vf.type = 'effect';
  vf.left = boundary_values.left;
  vf.right = boundary_values.right;
  vf.top = boundary_values.top;
  vf.bottom = boundary_values.bottom;
  
  if (vf.left == null || vf.right == null || vf.top == null || vf.bottom ==null) return vf;
  
  vf.at = function(obj) {
    wall_distances = {top: obj.pos.y - this.top, bottom: this.bottom - obj.pos.y,
                      left: obj.pos.x - this.left, right: this.right - obj.pos.x};
    
    for (d in wall_distances) { if (wall_distances[d] < 0) return vzero; }

    min_dist = Math.min(wall_distances.top, wall_distances.bottom, wall_distances.left, wall_distances.right);
    if (min_dist == wall_distances.top && obj.velocity.y > 0) obj.velocity.yreflect();
    if (min_dist == wall_distances.bottom && obj.velocity.y < 0) obj.velocity.yreflect();
    if (min_dist == wall_distances.right && obj.velocity.x < 0) obj.velocity.xreflect();
    if (min_dist == wall_distances.left && obj.velocity.x > 0) obj.velocity.xreflect();
    
    return vzero;
  };
  
  return vf;
}
function dynamic_reflecting_surfaces(obj, boundary_values) {
  // This is for when the surfaces are moving;
  // boundary_values should hold functions instead of values.
  if (boundary_values == null) {
    boundary_values = obj;
    obj = null;
  }
  var vf = field('effect', function(obj) { return vzero; });
  vf.left = boundary_values.left;
  vf.right = boundary_values.right;
  vf.top = boundary_values.top;
  vf.bottom = boundary_values.bottom;
  
  if (vf.left == null || vf.right == null || vf.top == null || vf.bottom ==null) return vf;
  
  vf.at = function(obj) {
    wall_distances = {top: obj.pos.y - this.top(), bottom: this.bottom() - obj.pos.y,
                      left: obj.pos.x - this.left(), right: this.right() - obj.pos.x};
    if (this.print && game.frame%30==0) {
      console.log(wall_distances);
    }
    
    for (d in wall_distances) { if (wall_distances[d] < 0) return; }

    min_dist = Math.min(wall_distances.top, wall_distances.bottom, wall_distances.left, wall_distances.right);
    if (min_dist == wall_distances.top && obj.velocity.y > 0) obj.velocity.yreflect();
    if (min_dist == wall_distances.bottom && obj.velocity.y < 0) obj.velocity.yreflect();
    if (min_dist == wall_distances.right && obj.velocity.x < 0) obj.velocity.xreflect();
    if (min_dist == wall_distances.left && obj.velocity.x > 0) obj.velocity.xreflect();
  };
  
  return vf;
}


function solid_object_surfaces(solid_obj, boundary_values) {
  solid_obj.bvals = boundary_values;
  
  var vf = field('effect', null);
  vf.obj = solid_obj;
  
  vf.top = function() { return this.obj.pos.y + this.obj.bvals.top };
  vf.bottom = function() { return this.obj.pos.y + this.obj.bvals.bottom };
  vf.left = function() { return this.obj.pos.x + this.obj.bvals.left };
  vf.right = function() { return this.obj.pos.x + this.obj.bvals.right };
  
  vf.at = function(obj) {
    wall_distances = {top: obj.pos.y - this.top(), bottom: this.bottom() - obj.pos.y,
                      left: obj.pos.x - this.left(), right: this.right() - obj.pos.x};
    for (d in wall_distances) { if (wall_distances[d] < 0) return; }
    min_dist = Math.min(wall_distances.top, wall_distances.bottom, wall_distances.left, wall_distances.right);
    vec = xy(0, 0);
    
    if (obj.is_navigated) {
        if (min_dist == wall_distances.top) {    dir = 'up'; vec = xy(0, -min_dist-1); }
        if (min_dist == wall_distances.bottom) { dir = 'down'; vec = xy(0,  min_dist+1); }
        if (min_dist == wall_distances.right) {  dir = 'right'; vec = xy( min_dist+1, 0); }
        if (min_dist == wall_distances.left) {   dir = 'left'; vec = xy(-min_dist-1, 0); }
    
        obj.move(vec);
        for (var i=0; i<obj.navigation.length; i++) {
            if (game.frame%150 == 0 && obj.id == 'grownup') console.log(vec+"", dir, obj.navigation[i]);
            if (obj.navigation[i] != dir) obj.navigation.splice(i, 1);
        }
    }
    else {
        if (min_dist == wall_distances.top && obj.velocity.y > 0) {    obj.velocity.yreflect(); }
        if (min_dist == wall_distances.bottom && obj.velocity.y < 0) { obj.velocity.yreflect(); }
        if (min_dist == wall_distances.right && obj.velocity.x < 0) {  obj.velocity.xreflect(); }
        if (min_dist == wall_distances.left && obj.velocity.x > 0) {   obj.velocity.xreflect(); }
    }
  }
  
  return vf;
}

function goToDestination(scale_factor) {
  return field('velocity', function(obj) {
    if (!obj.getDestination) return xy(0, 0);
    if (equals(obj.pos, obj.getDestination())) return xy(0, 0);
    return scale(subtract(obj.getDestination(), obj.pos), scale_factor);
  });
}

function leaveDestination(scale_factor) {
  return field('velocity', function(obj) {
    if (!obj.getDestination) return xy(0, 0);
    return scale(subtract(obj.pos,obj.getDestination()), scale_factor)
  
  });
}
/*
    flee_grownup = field('velocity', function(kid) {
        if (decideBehavior() != 'flee') return xy(0, 0);
        if (subtract(kid.pos, grownup.pos).r < avoid_grownup_radius)
            return rth(1, subtract(kid.pos, grownup.pos).th);
            
        return xy(0, 0);
    }).bound(game.boundary);
*/

function springforce(center, k) {
  vf = field('acceleration', null);
  vf.k = k;
  vf.center = xy(center.x, center.y);
  vf.at = function(obj) {
    //console.log(obj.pos+"", this.center+"", subtract(obj.pos, this.center)+"", this.k, scale(subtract(obj.pos, this.center), this.k)+"");
    return scale(subtract(this.center, obj.pos), this.k);
  }
  return vf
}
function oscillation(frequency, amplitude) { // Frequency in hz
  vf = field('acceleration', null);
  vf.t0 = getTime();
  vf.amp = amplitude; 
  vf.freq = frequency;
  vf.at = function(obj) {
    t = (getTime() - this.t0)/1000;
    console.log(t, Math.cos(2*Math.PI*this.freq*t), scale(this.amp*2*Math.PI*this.freq, Math.cos(2*Math.PI*this.freq*t))+"") 
    return scale(this.amp*2*Math.PI*this.freq, Math.cos(2*Math.PI*this.freq*t));
    
  }
  vf.f0 = game.frame;
  return vf
}

// This makes an item stay close to the character holding it
function heldBy(holder, offset) {
  vf = field('effect', function(item) { 
      item.pos = add(offset, holder.getPos());
  });
  return vf
}

// Two implementations of random walks
function random_walk(max_speed) {
  return field('velocity', function(obj) {
    if (obj.is_dynamic) return randAngle(Math.random()*max_speed);
    return xy(0, 0);
  });
}

function random_turns(interval, angle1, angle2){
  if (angle1 == null) angle_width = Math.PI*2;
  else if (angle2 == null) angle_width = angle1;
  else angle_width = angle2-angle1;
  return field('effect', function(obj) {
    if (obj.is_dynamic && mod(game.frame, interval) == 0) {
      da = Math.random()*angle_width;
      if (Math.random()<0.5) da *= -1;
      obj.velocity.rotate(da);
    }
  });
}

function random_turns_with_pauses(interval, pause, pause_width, angle1, angle2){
  if (angle1 == null) angle_width = Math.PI*2;
  else if (angle2 == null) angle_width = angle1;
  else angle_width = angle2-angle1;
  vf = field('effect', null);
  vf.pause = pause + Math.random()*pause_width;
  vf.at = function(obj) {
    if (obj.is_dynamic) {
      if (!obj._velocity) obj._velocity = obj.velocity;
      if (mod(game.frame, interval+this.pause) > interval) {
        obj.velocity = xy(0, 0);
      }
      if (mod(game.frame, interval+this.pause) == 0) {
        this.pause = pause + Math.random()*pause_width;
        da = Math.random()*angle_width;
        if (Math.random()<0.5) da *= -1;
        obj.velocity = obj._velocity;
        obj.velocity.rotate(da);
        obj._velocity = obj.velocity;
      }
    }
  }
}
/*

function random_turns_with_pauses(interval, pause, angle){
  if (angle == null) angle_width = Math.PI*2;
  if (angle.length && angle.length == 2) angle_width = angle[1]-angle[0];
  if (angle.length && angle.length == 1) angle_width = angle[0];
  else angle_width = angle;
  if (pause.length && pause.length==2) { pause_width = pause[1]; pause = pause[0]; }
  if (pause.length && pause.length==1) {pause = pausse[0]; pause_width = 0; }
  else pause_width = 0;
  vf = field('effect', null);
  vf.pause = pause + Math.random()*pause_width;
  vf.at = function(obj) {
    if (obj.is_dynamic) {
      if (!obj._velocity) obj._velocity = obj.velocity;
      if (mod(game.frame, interval+this.pause) > interval) {
        obj.velocity = xy(0, 0);
      }
      if (mod(game.frame, interval+this.pause) == 0) {
        this.pause = pause + Math.random()*pause_width;
        da = Math.random()*angle_width;
        if (Math.random()<0.5) da *= -1;
        obj.velocity = obj._velocity;
        obj.velocity.rotate(da);
        obj._velocity = obj.velocity;
      }
    }
  }
}
//*/

// Field superposition
function superpose(vf1, vf2) {
  vf = field(null, null);
  vf.type = vf1.type
  vf.f1 = vf1;
  vf.f2 = vf2;
  vf.at = function(obj) {
    at1 = this.f1.at(obj);
    at2 = this.f2.at(obj);
    if (this.f2.type != this.type) {
      if (this.f2.type == 'velocity') obj.move(at2);
      if (this.f2.type == 'acceleration') obj.velocity.add(at2);
      return at1;
    }
    if (this.type != 'effect') return add(at1, at2);
  }
}