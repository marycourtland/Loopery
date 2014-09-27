loopery.Orb = function(id, canvas_context, lookup_func) {
  this.obj_type = 'orb';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.init = function(data) {
    this.color = data.color || 'white';
    this.start = data.start;
    this.start_dir = data.start_dir;
    this.end = data.end;

    // dynamic things
    this.oldpos = null;
    this.pos = 0.5; // should the orb have an initial starting pos?
    this.track = this.lookup(data.start);
    this.dir = this.start_dir; 
  }

  this.getData = function() {
    return {
      id: this.id,
      color: this.color,
      start: this.start,
      start_dir: this.start_dir,
      end: this.end
    }
  }

  this.tick = function() {
    // if (game.disable_gameplay) return;
    // if (this.disabled) return;

    this.move();
    
    // check to see whether the orb is on its ending track
    // (TODO)
  }

  this.move = function() {
    this.oldpos = this.pos; // it's just a number so no need to deepcopy it
    this.pos = this.track.getNextPos(this.pos, this.dir, loopery.orb_speed);
  }

  this.draw = function() {
    draw.circle(this.ctx, this.track.getPosCoords(this.pos), loopery.display.orb_radius, {
      fill: this.color,
      stroke: this.color
    });
  }
}
