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
    this.track = this.lookup({id: data.start});
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

  this.move = function() {
    this.oldpos = this.pos; // it's just a number so no need to deepcopy it
    this.pos = this.track.getNextPos(this.pos, this.dir, loopery.orb_speed);
  }

  this.getLoc = function() {
    return this.track.getPosCoords(this.pos);
  }

  this.isCollidingWith = function(orb) {
    if (orb.id === this.id) { return false; }
    //if (loopery.state.frame %100 === 0) console.debug(vround(this.getLoc())+'', vround(orb.getLoc())+'', distance(this.getLoc(), orb.getLoc()));
    return distance(orb.getLoc(), this.getLoc()) < loopery.display.orb_radius;
  }

  $(this).on('draw', function() {
    draw.circle(this.ctx, this.track.getPosCoords(this.pos), loopery.display.orb_radius, {
      fill: this.color,
      stroke: this.color
    });
  });

  $(this).on('tick', function() {
    // if (game.disable_gameplay) return;
    // if (this.disabled) return;

    this.move();

    // Detect collision
    var orbs = this.lookup({group: 'orbs'});
    for (var id in orbs) {
      if (this.isCollidingWith(orbs[id])) { $(this.trigger('collision', {orb: orbs[id]})) }
    }

    // detect levelcomplete
    if (this.track.id === this.end) { $(this).trigger('levelcomplete'); }
  });


  // EVENTS DURING GAMEPLAY

  $(this).on('collision', function(evt, data) {
    // this should be overridden by subtypes (like enemies)
    // reverse direction!
    this.dir *= -1;
  })

  $(this).on('levelcomplete', function(evt, data) {
    // todo
    console.debug('woohoo, you finished a level')
  })

}
