// Train
function makeTrain(color, track) {
  train = new GameObject(game);
  train.type = 'train';
  train.color = color;
  train.track = track;
  train.dir = 1; // For circular tracks, 1=cw and -1=ccw. For linear tracks, 1=towards track2, -1=towards track1
  train.pos = 0;
  train.disabled = false;
  train.disable = function() { this.disabled = true; }
  train.enable = function() { this.disabled = false; }
  train.setTrack = function(track, pos, dir) {
    if (pos === null) pos = 0;
    if (dir === null) dir = 1;
    this.track = track;
    this.pos = pos;
    this.dir = dir;
  }
  train.tick = function() {
    if (this.disabled) return;
    // move the train
    var oldpos = this.pos; // it's just a number so no need to deepcopy it
    this.pos = this.track.getNextPos(this.pos, this.dir);
    
    // check to see whether the train has gone onto a new track
    var new_track = this.track.checkForConnections(oldpos, this.pos);
    if (new_track && (new_track.type !== 'linear' || new_track.parent_track_winding[this.track.id] === this.dir)) {
      this.dir = new_track.getDirFromOldTrack(this.track);
      this.pos = new_track.getPosFromOldTrack(this.track) + this.dir * (this.pos - oldpos);
      this.track = new_track;
      
      // TODO (low priority): a train encounters a movement hiccup when it goes backwards
      // along a linear track and then transfers to a circular track going CCW
    }
    
  }
  train.draw = function() {
    if (this.disabled) return;
    circle(this.ctx, this.track.getPosCoords(this.pos), game.display.train_radius, this.color);
  }
  return train;
}

