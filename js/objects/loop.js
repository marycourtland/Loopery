loopery.Loop = function(id, canvas_context, lookup_func) {
  this.group = 'loops';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;
  this.show_shade = false;
  Events.init(this);

  this.init = function(data) {
    this.old_loc = xy(-1, -1);
    this.loc = xy(data.x, data.y);
    this.radius = data.r;
    // (two different formats of event triggering - hacky)
  }

  this.getData = function() {
    return {
      id: this.id,
      x: this.loc.x,
      y: this.loc.y,
      r: this.radius
    }
    // todo: shading
  }

  this.on('tick', 'tick_loop', function() {});

  // See if the loop has moved placement (e.g. in level editor)
  this.hasMoved = function() {
    return !equals(this.loc, this.old_loc);
  }
  
  // Determine an orb's next position on the loop (as it's moving)
  this.getNextPos = function(old_pos, dir, speed) {
    return mod(old_pos + dir * loopery.getFrameSpeed(speed) / (2 * Math.PI * this.radius), 1);
  }
  
  // Given an orb's position on the loop (from 0 to 1), return the XY coords
  this.getPosCoords = function(pos) {
    var angle = pos * 2 * Math.PI;
    return add(this.loc, rth(this.radius, angle));
  }

  // Given an orb's loc (xy coords), return position on loop
  this.getPosFromLoc = function(loc) {
    return subtract(loc, this.loc).th / (2 * Math.PI);
  }

  this.getPosFromOldTrack = function(connector) {
    return connector.parent_track_pos[this.id];
  }

  this.getDirFromOldTrack = function(connector) {
    return -1 * connector.parent_track_winding[this.id];
  }

  this.contains = function(loc) {
    return distance(loc, this.loc) < (this.radius - loopery.display.track_width/2);
  }

  this.shade = function(color) {
    if (!color) { color = 'white'; }
    draw.circle(this.ctx, this.loc, this.radius - loopery.display.track_width/2,
      {
        fill: color,
        alpha: 0.3
      }
    );
    this.show_shade = false;
  }

  this.shadeHalf = function(side, color) {
    // Side can be +1 (rightwards) or -1 (leftwards)
    if (!color) { color = 'white'; }
    var angle1 = (side === 1) ? -Math.PI/2 : Math.PI/2;
    var angle2 = (side === 1) ? Math.PI/2 : 3*Math.PI/2;
    draw.arc(this.ctx, this.loc, this.radius - loopery.display.track_width/2, angle1, angle2,
      {
        fill: color,
        alpha: 0.3
      }
    );
    this.show_shade = false;
  }

  this.shouldJointsBeVisible = function() {
    // Show joints for any loop w/ a player orb on it
    var orbs = this.lookup({loop_id: this.id, group: 'orbs'});

    var player_orbs = orbs.filter(function(orb) {
      return ('player' in orb.roles);
    });
    return player_orbs.length > 0;
  }
  
  this.on('draw', 'draw_loop', function() {
    if (!loopery.state.redraw_bg) { return; }
    if (this.show_shade || (loopery.display.shade_hovered_circle_track && this.contains(loopery.mouse.pos))) {
      this.shade();
    }
    draw.circle(this.ctx, this.loc, this.radius, {
      fill: 'transparent',
      stroke: loopery.display.track_color,
      lineWidth: loopery.display.track_width
    });
    this.old_loc = this.loc.copy();
  });

  this.bindEvents = function() {
    this.on('click', function() {
      if (loopery.features.toggleAllJointsOnLoop) {
        this.lookup({loop_id: this.id, group: 'joints'}).forEach(function(joint) {
          console.log('Joint:', joint);
          joint.toggle();
        });
      }
    });
  }
}

