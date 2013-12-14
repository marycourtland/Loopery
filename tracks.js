// Generic track
function makeTrack() {
  var track = new GameObject(game);
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
function makeCircleTrack(pos, radius) {
  var track = makeTrack();
  track.type = 'circular';
  
  track.radius = radius;
  track.placeAt(pos);
  track.connections = {}; // linear tracks connecting this with another circular track
  
  track.draw = function() {
    emptyCircle(this.ctx,
      this.pos,
      this.radius,
      game.display.track_color,
      game.display.track_width
    );
  }
  
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
      if (isBetweenOnCircle(p, oldpos, newpos, 1)) return track;
      
    }
    return false;
  }
  
  track.getPosFromOldTrack = function(linear_track) {
    return linear_track.parent_track_pos[this.id];
  }
  
  track.getDirFromOldTrack = function(linear_track) {
    return -1 * linear_track.parent_track_winding[this.id];
  }
  
  return track;
}

// Linear tracks connect the circular tracks together
// winding = 1 means: if the linear track was a string, it would wrap CW around a parent circular track
// winding = -1 means: it would wrap CCW
function makeLinearTrack(track1, pos1, winding1, track2, pos2, winding2) {
  var track = makeTrack();
  track.type = 'linear';
  
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
  
  var p1 = track1.getPosCoords(pos1);
  var p2 = track2.getPosCoords(pos2);
  console.log(p1+" " + p2);
  track.angle = subtract(p2, p1).th;
  track.length = subtract(p2, p1).r;
  
  track.draw = function() {
    line(this.ctx,
      this.track1.getPosCoords(this.parent_track_pos[this.track1.id]),
      this.track2.getPosCoords(this.parent_track_pos[this.track2.id]),
      game.display.track_color,
      game.display.track_width
    )
  }
  
  track.getNextPos = function(old_pos, dir) {
    return old_pos + dir * game.train_speed / this.length;
  }
  
  // given the id of a circular track on one end of this track,
  // returns the track id of the circular track on the other end 
  track.getOppositeTrackId = function(track_id) {
    if (!(track_id === this.track1.id || track_id === this.track2.id)) return false;
    if (track_id === this.track1.id) return this.track2.id;
    return this.track1.id;
  }
  
  track.getPosCoords = function(pos, echo) {
    if (echo) {
      console.log(this.track1.getPosCoords(this.parent_track_pos[this.track1.id]));
      console.log(rth(this.length * pos, this.angle));
    }
    return add(this.track1.getPosCoords(this.parent_track_pos[this.track1.id]), rth(this.length * pos, this.angle));
  }
  
  track.checkForConnections = function(oldpos, newpos) {
    if (newpos > 1) return this.track2;
    if (newpos < 0) return this.track1;
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
  
  return track;
}

