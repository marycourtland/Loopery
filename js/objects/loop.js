loopery.Loop = function(id, canvas_context, lookup_func) {
  this.obj_type = 'loop';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.init = function(data) {
    this.old_loc = xy(-1, -1);
    this.loc = xy(data.x, data.y);
    this.radius = data.r;
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

  this.tick = function() {
    // See if the loop has moved placement (e.g. in level editor)
    if (equals(this.loc, this.old_loc)) return;
    this.old_loc = this.loc.copy();
    // todo: tell the attached connectors to move
  }

  // Determine an orb's next position on the loop (as it's moving)
  this.getNextPos = function(old_pos, dir, speed) {
    return mod(old_pos + dir * speed / (2 * Math.PI * this.radius), 1);
  }
  
  // Given an orb's position on the loop (from 0 to 1), return the XY coords
  this.getPosCoords = function(pos) {
    var angle = pos * 2 * Math.PI;
    return add(this.loc, rth(this.radius, angle));
  }

  // This looks to see if an orb going from oldpos to newpos has
  // switched onto a connector.
  // Returns the connector that the train goes onto; or false is there is none
  this.checkForConnections = function(oldpos, newpos) {
    for (connector_id in this.connections) {
      if (!this.connections[connector_id]) continue; // skip joints that aren't turned on
      var connector = this.lookup(id, 'connectors');
      var p = connector.parent_track_pos[this.id];
      if (isBetweenOnCircle(p, oldpos, newpos, 1)) { return connector; }
    }
    return false;
    // TODO: fix this method (with new way of accessing a loop's connectors)
  }

  this.getPosFromOldTrack = function(connector) {
    // TODO: fix this method
    return connector.parent_track_pos[this.id];
  }

  this.getDirFromOldTrack = function(connector) {
    return -1 * connector.parent_track_winding[this.id];
    // TODO: fix this method
  }

  this.toggleJoint = function(connector_id) {
    // TODO: fix this method
    if (!(connector_id in this.connections)) return;
    this.connections[connector_id] = !this.connections[connector_id];
    
  }

  this.contains = function(loc) {
    return distance(loc, this.loc) < (this.radius - loopery.display.track_width/2);
  }
  
  this.draw = function() {
    draw.circle(this.ctx, this.loc, this.radius, {
      fill: 'transparent',
      stroke: loopery.display.track_color,
      lineWidth: loopery.display.track_width
    });
  }
}
