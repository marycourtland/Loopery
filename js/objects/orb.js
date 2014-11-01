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

  this.tick = function() {
    // if (game.disable_gameplay) return;
    // if (this.disabled) return;

    this.move();

    for (var evt_name in this.events) {
      var evt = this.events[evt_name];
      if (evt.hasOccurred.call(this)) {
        evt.onOccur.call(this);
      }
    }

    // check to see whether the orb is bumping into another orb

    
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

  this.getLoc = function() {
    return this.track.getPosCoords(this.pos);
  }

  this.isCollidingWith = function(orb) {
    if (orb.id === this.id) { return false; }
    //if (loopery.state.frame %100 === 0) console.debug(vround(this.getLoc())+'', vround(orb.getLoc())+'', distance(this.getLoc(), orb.getLoc()));
    return distance(orb.getLoc(), this.getLoc()) < loopery.display.orb_radius;
  }

  // EVENTS DURING GAMEPLAY
  // the functions should be called with this bound to the orb obj
  this.events = {
    collision: {
      hasOccurred: function() {
        var orbs = this.lookup({group: 'orbs'});
        for (var id in orbs) {
          //if (loopery.state.frame % 100 === 0) { console.log(id, this.id)}
          if (this.isCollidingWith(orbs[id])) { return true; }
        }
        return false;
      },
      onOccur: function() {
        // reverse direction!
        this.dir *= -1;
      }
    },

    levelcomplete: {
      hasOccurred: function() {
        // todo
        return false
      },
      onOccur: function() {
        // todo
        console.debug('woohoo, you finished a level')
      }
    }
  }
}
