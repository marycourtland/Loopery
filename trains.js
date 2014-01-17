// Train
function makeTrain(color, track) {
  train = new GameObject(game);
  train.type = 'train';
  train.color = color;
  train.track = track;
  train.dir = 1; // For circular tracks, 1=cw and -1=ccw. For linear tracks, 1=towards track2, -1=towards track1
  train.pos = 0;
  train.is_player = false;
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
    if (game.hide_trains) return;
    if (this.disabled) return;
    // move the train
    this.oldpos = this.pos; // it's just a number so no need to deepcopy it
    this.pos = this.track.getNextPos(this.pos, this.dir);
    
    // check to see whether the train has gone onto a new track
    var new_track = this.track.checkForConnections(this.oldpos, this.pos);
    if (new_track && (new_track.type !== 'linear' || new_track.parent_track_winding[this.track.id] === this.dir)) {
      this.dir = new_track.getDirFromOldTrack(this.track);
      this.pos = new_track.getPosFromOldTrack(this.track) + this.dir * shortestDistanceOnCircle(this.pos, this.oldpos, 1);
      this.track = new_track;
      console.log('Transfer to', new_track.id);
      // If this is one of the player's trains and it reached an ending circle,
      // then move on to the next level
      if (this.is_player && new_track.is_end) {
        // when a train reaches track1_end, then the player has chosen it
        if (new_track.id === track1_end.id) game.choosePlayerTrain(this);
        
        game.doNextLevel();
      }
      
      // TODO (low priority): a train encounters a movement hiccup when it goes backwards
      // along a linear track and then transfers to a circular track going CCW
    }
    
  }
  train.draw = function() {
    if (game.hide_trains) return;
    if (this.disabled) return;
    circle(this.ctx, this.track.getPosCoords(this.pos), game.display.train_radius, this.color);
  }
  return train;
}

