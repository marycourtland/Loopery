// TODO: ensure circular tracks are drawn after linear tracks

// Generic track
function makeTrack(level) {
  var track = makeLevelObject(level);
  //var track = new GameObject(game);
  track.id = game.next_track;
  game.next_track++;
  game.tracks.push(track);
  
  // Subclasses should implement these methods:
  //   track.getNextPos
  //   track.getPosCoords
  //   track.checkForConnections
  //   track.getPosFromOldTrack
  //   track.getDirFromOldTrack
  
  return track;
  
}

// Circular track
function makeCircleTrack(level, pos, radius) {
  var track = makeTrack(level);
  track.type = 'circular';
  
  track.color = game.display.track_color;
  
  track.radius = radius;
  track.placeAt(pos);
  track.connections = {}; // linear tracks connecting this with another circular track
  
  track.is_end = false;
  track.setEnd = function() { this.is_end = true; }
  
  track.drawActions.push(function() {
    emptyCircle(this.ctx,
      this.pos,
      this.radius,
      this.color,
      game.display.track_width
    );
  })
  
  track.old_pos = xy(-1, -1);
  track.tickActions.push(function() {
    if (equals(this.pos, this.old_pos)) return;
    this.old_pos = this.pos.copy();
    for (var i in this.connections) {
      game.tracks[i].recomputePlacement();
    }
  });
  
  track.getNextPos = function(old_pos, dir) {
    return mod(old_pos + dir * game.train_speed / (2 * Math.PI * this.radius), 1);
  }
  
  track.getPosCoords = function(pos) {
    var angle = pos * 2 * Math.PI;
    return add(this.pos, rth(this.radius, angle));
  }
  
  // This looks to see if an object going from oldpos to newpos has
  // switched onto a linear track.
  // Returns the track that the train goes onto; or false is there is none
  track.checkForConnections = function(oldpos, newpos) {
    for (track_id in this.connections) {
      if (!this.connections[track_id]) continue; // skip tracks that aren't turned on
      var track = game.tracks[track_id];
      var p = track.parent_track_pos[this.id];
      if (isBetweenOnCircle(p, oldpos, newpos, 1)) { return track; }
      
    }
    return false;
  }
  
  track.getPosFromOldTrack = function(linear_track) {
    return linear_track.parent_track_pos[this.id];
  }
  
  track.getDirFromOldTrack = function(linear_track) {
    return -1 * linear_track.parent_track_winding[this.id];
  }
  
  track.toggleJoint = function(track_id) {
    if (!(track_id in this.connections)) return;
    this.connections[track_id] = !this.connections[track_id];
    
  }
  
  track.contains = function(pos) {
    return distance(pos, this.pos) < (this.radius - game.display.track_width/2);
  }
  
  // For testing purposes
  handle(track);
  
  return track;
}

// Linear tracks connect the circular tracks together
// winding = 1 means: if the linear track was a string, it would wrap CW around a parent circular track
// winding = -1 means: it would wrap CCW
function makeLinearTrack(level, track1, pos1, winding1, track2, pos2, winding2, disable_clickers) {
  var track = makeTrack(level);
  track.type = 'linear';
  track.color = game.display.track_color;
  
  pos1 = mod(pos1, 1);
  pos2 = mod(pos2, 1);
  
  // parent circular tracks
  // track1 is at the end where pos=0;
  // track2 is at the end where pos=1
  track.track1 = track1;
  track.track2 = track2;
  track.parent_track_pos = {};
  track.parent_track_pos[track1.id] = pos1;
  track.parent_track_pos[track2.id] = pos2;
  track.parent_track_winding = {};
  track.parent_track_winding[track1.id] = winding1;
  track.parent_track_winding[track2.id] = winding2;
  track1.connections[track.id] = false;
  track2.connections[track.id] = false;
  
  // Make 'clicker' objects
  // These are the little shadows that appear over joints between
  // linear and circular tracks. When clicked, they toggle the joint.
  if (!disable_clickers) {
    track.clicker1 = makeLevelObject(level);
    track.clicker2 = makeLevelObject(level);
    track.clicker1.type = 'clicker';
    track.clicker2.type = 'clicker';
    track.clicker1.track = track; // circular references, yay
    track.clicker2.track = track;
    track.clicker1.pos = track1.getPosCoords(pos1);
    track.clicker2.pos = track2.getPosCoords(pos2);
    track.clicker1.drawActions.push(function() {
      if (distance(game.mouse.pos, this.pos) > game.joint_click_radius) { return; }
      var old_alpha = this.ctx.globalAlpha;
      this.ctx.globalAlpha = 0.3;
      circle(this.ctx, 
        this.pos,
        game.joint_click_radius,
        'black'
      )
      this.ctx.globalAlpha = old_alpha;
    })
    track.clicker2.drawActions.push(function() {
      if (distance(game.mouse.pos, this.pos) > game.joint_click_radius) { return; }
      var old_alpha = this.ctx.globalAlpha;
      this.ctx.globalAlpha = 0.3;
      circle(this.ctx, 
        this.pos,
        game.joint_click_radius,
        'black'
      )
      this.ctx.globalAlpha = old_alpha;
    })
    track.clicker1.contains = function(p) {
      if (game.levels[game.current_level].id != this.level.id) return false;
      return distance(p, this.pos) <= game.joint_click_radius;
    }
    track.clicker2.contains = function(p) { // todo: this is also supposed to be the same as clicker1.contains
      if (game.levels[game.current_level].id != this.level.id) return false;
      return distance(p, this.pos) <= game.joint_click_radius;
    }
    track.clicker1.onclick = function(p) {
      if (game.levels[game.current_level].id != this.level.id) return;
      this.track.track1.toggleJoint(this.track.id);
    }
    track.clicker2.onclick = function(p) {
      if (game.levels[game.current_level].id != this.level.id) return;
      this.track.track2.toggleJoint(this.track.id);
    }
  }
  
  track.recomputePlacement = function() {
    if (this.which_outer !== undefined) {
      // If this track was generated as an outer tangent, then regenerate it
      var pts = getOuterTangents(track1, track2);
      this.parent_track_pos[this.track1.id] = pts[this.which_outer][0];
      this.parent_track_pos[this.track2.id] = pts[this.which_outer][1];
    }
    if (this.which_inner !== undefined) {
      // If this track was generated as an outer tangent, then regenerate it
      var pts = getInnerTangents(track1, track2);
      this.parent_track_pos[this.track1.id] = pts[this.which_inner][0];
      this.parent_track_pos[this.track2.id] = pts[this.which_inner][1];
    }
    
    var p1 = this.track1.getPosCoords(this.parent_track_pos[this.track1.id]);
    var p2 = this.track2.getPosCoords(this.parent_track_pos[this.track2.id]);
    this.angle = subtract(p2, p1).th;
    this.length = subtract(p2, p1).r;
    
    if (this.clicker1 && this.clicker2) {
      this.clicker1.pos = track.getPosCoords(0);
      this.clicker2.pos = track.getPosCoords(1);
    }
  }
  
  track.drawActions.push(function() {
    // Draw the line
    line(this.ctx,
      this.track1.getPosCoords(this.parent_track_pos[this.track1.id]),
      this.track2.getPosCoords(this.parent_track_pos[this.track2.id]),
      this.color,
      game.display.track_width
    )
    
    // If the track isn't toggled, then show darkened ends
    if (!this.track1.connections[this.id]) {
      lineGradient(game.ctx,
        this.getPosCoords(0),
        this.getPosCoords(game.display.darkened_track_extent),
         'black', 'white',
        game.display.track_width);
    }
    
    if (!this.track2.connections[this.id]) {
      lineGradient(game.ctx,
        this.getPosCoords(1),
        this.getPosCoords(1 - game.display.darkened_track_extent),
        'black', 'white',
        game.display.track_width);
    }
  })
  
  track.getNextPos = function(old_pos, dir) {
    return old_pos + dir * game.train_speed / this.length;
  }
  
  // given the id of a circular track on one end of this track,
  // returns the track id of the circular track on the other end
  // TODO: I don't remember using this method ever... if so, remove it
  track.getOppositeTrackId = function(track_id) {
    if (!(track_id === this.track1.id || track_id === this.track2.id)) return false;
    if (track_id === this.track1.id) return this.track2.id;
    return this.track1.id;
  }
  
  track.getPosCoords = function(pos) {
    return add(this.track1.getPosCoords(this.parent_track_pos[this.track1.id]), rth(this.length * pos, this.angle));
  }
  
  track.checkForConnections = function(oldpos, newpos) {
    if (newpos > 1) { return this.track2; }
    if (newpos < 0) { return this.track1; }
    return false;
  }
  
  track.getPosFromOldTrack = function(circular_track) {
    if (circular_track.id === this.track1.id) return 0;
    return 1;
  }
  
  track.getDirFromOldTrack = function(circular_track) {
    if (circular_track.id === this.track1.id) return 1;
    return -1;
  }
  
  track.recomputePlacement();
  
  return track;
}



// Utility methods - to find position of linear tracks tangent to two circular tracks
// WARNING: BAD CODE (but it works)

function getOuterTangents(track1, track2, echo) {
  if (track2.radius === track1.radius) {
    var dd = subtract(track1.pos, track2.pos);
    return [
      [(dd.th + Math.PI/2)/(2 * Math.PI), (dd.th + Math.PI/2)/(2 * Math.PI)],
      [(dd.th - Math.PI/2)/(2 * Math.PI), (dd.th - Math.PI/2)/(2 * Math.PI)]
    ]
  }
  
  // circle1 should be the smaller one, and circle2 should be the larger one
  if (track2.radius > track1.radius) {
    p1 = track1.pos
    p2 = track2.pos
    rad1 = track1.radius
    rad2 = track2.radius
  }
  else {
    p1 = track2.pos
    p2 = track1.pos
    rad1 = track2.radius
    rad2 = track1.radius
  }
  var dd = subtract(p2, p1);
  var r21 = rad2 - rad1;
  var l = Math.sqrt(dd.r*dd.r - r21*r21);
  var lth1 = dd.th - Math.acos(l/dd.r);
  var lth2 = dd.th + Math.acos(l/dd.r);
  var ll1 = rth(l, lth1);
  var ll2 = rth(l, lth2);
  var rr1 = subtract(ll1, dd);
  var rr2 = subtract(ll2, dd);
  var dr1 = rth(rad1, rr1.th);
  var dr2 = rth(rad1, rr2.th);
  
  // This returns the circular positions
  // NB: the order in which they are returned should depend on the order in
  // which they were passed into the method, not on their track size. But
  // dr1, dr2 etc are defined based on size. So that's why this if statement
  // is needed. 
  // (The two return arrays in each case are the same, except for swapped elements)
  if (track2.radius > track1.radius) {
    return [
      [dr1.th / (2*Math.PI), add(rr1, dr1).th / (2*Math.PI)],
      [dr2.th / (2*Math.PI), add(rr2, dr2).th / (2*Math.PI)],
    ]
  }
  else {
    return [
      [dr2.th / (2*Math.PI), add(rr2, dr2).th / (2*Math.PI)],
      [dr1.th / (2*Math.PI), add(rr1, dr1).th / (2*Math.PI)],
    ]
  }
    
  // This returns the actual coordinate positions of the track endpoints
  //return [
  //  [add(p1, dr1), add(add(p2, rr1), dr1)],
  //  [add(p1, dr2), add(add(p2, rr2), dr2)],
  //]
}

function getInnerTangents(track1, track2, echo) {
  /*if (track2.radius === track1.radius) {
    var dd = subtract(p2, p1);
    return [
      [dd.th + Math.PI/4, dd.th + Math.PI/4],
      [dd.th - Math.PI/4, dd.th - Math.PI/4]
    ]
  }*/
  
  // circle1 should be the larger one, and circle2 should be the smaller one
  if (track1.radius >= track2.radius) {
    p1 = track1.pos
    p2 = track2.pos
    rad1 = track1.radius
    rad2 = track2.radius
  }
  else {
    p1 = track2.pos
    p2 = track1.pos
    rad1 = track2.radius
    rad2 = track1.radius
  }
  var dd = subtract(p2, p1);
  var r21 = rad2 + rad1;
  if (dd.r < r21) return [[null, null], [null, null]]; // circles are overlapping
  
  var l = Math.sqrt(dd.r*dd.r - r21*r21);
  var lth1 = dd.th - Math.acos(l/dd.r);
  var lth2 = dd.th + Math.acos(l/dd.r);
  var ll1 = rth(l, lth1);
  var ll2 = rth(l, lth2);
  var rr1 = subtract(ll1, dd);
  var rr2 = subtract(ll2, dd);
  
  // This returns the circular positions
  // NB: the order in which they are returned should depend on the order in
  // which they were passed into the method, not on their track size. But
  // dr1, dr2 etc are defined based on size. So that's why this if statement
  // is needed. 
  // (The two return arrays in each case are the same, except for swapped elements)
  
  // NOTE:
  // Here, we use >. However at the beginning of the method we use >=
  // This is not an accident. For some reason, it works when it's this way
  // TODO: find out why
  if (true || track2.radius > track1.radius) {
    return [
      //[rr1.th / (2*Math.PI), (rr1.th + Math.PI/2) / (2*Math.PI)],
      //[rr2.th / (2*Math.PI), (rr2.th + Math.PI/2) / (2*Math.PI)],
      [mod((rr1.th + Math.PI) / (2*Math.PI), 1), mod(rr1.th / (2*Math.PI), 1)],
      [mod((rr2.th + Math.PI) / (2*Math.PI), 1), mod(rr2.th / (2*Math.PI), 1)],
    ]
  }
  else {
    return [
      [mod((rr2.th + Math.PI) / (2*Math.PI), 1), mod(rr2.th / (2*Math.PI), 1)],
      [mod((rr1.th + Math.PI) / (2*Math.PI), 1), mod(rr1.th / (2*Math.PI), 1)],
    ]
  }

}

// There are always two possible outer tangent tracks. The 'which' variable denotes which one should be made: 0 or 1.
function makeOuterTangentTrack(level, track1, track2, which, disable_clicker) {
  if (which === null) which = 0;
  var pts = getOuterTangents(track1, track2);
  var track = makeLinearTrack(level, track1, mod(pts[which][0], 1), (1 - which*2), track2, mod(pts[which][1], 1), -(1 - which*2), disable_clicker);
  track.which_outer = which;
  return track;
}

function makeInnerTangentTrack(level, track1, track2, which, disable_clicker) {
  if (which === null) which = 0;
  var pts = getInnerTangents(track1, track2);
  var track = makeLinearTrack(level, track1, mod(pts[which][0], 1), -(1 - which*2), track2, mod(pts[which][1], 1), -(1 - which*2), disable_clicker);
  track.which_inner = which;
  return track;
}
