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
    this.roles = data.roles;

    // dynamic things
    this.oldpos = null;
    this.pos = data.start_pos || 0.5;
    this.track = this.lookup({id: data.start});
    this.dir = this.start_dir;

    // apply roles
    for (var i = 0; i < this.roles.length; i++) {
      console.debug(this.roles[i]);
      loopery.Orb.Roles[this.roles[i]].init(this);
    }
  }

  this.getData = function() {
    return {
      id: this.id,
      color: this.color,
      start: this.start,
      start_dir: this.start_dir,
      end: this.end,
      roles: this.roles
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
    return distance(orb.getLoc(), this.getLoc()) < loopery.display.orb_radius;
  }


  this.blowup = function() {
    if (this.destroyed) { return; } // can't blow up multiple times!

    this.destroyed = true;
    $(this).unbind('tick');
    $(this).unbind('draw');
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
      if (this.isCollidingWith(orbs[id])) { $(this).trigger('collision', {orb: orbs[id]}) }
    }

    // detect levelcomplete
    if (this.track.id === this.end) { $(this).trigger('levelcomplete'); }
  });

}

// ORB ROLES

loopery.Orb.Roles = {};

loopery.Orb.Roles.player = {
  init: function(orb) {
    $(orb).on('levelcomplete', function(evt, data) {
      // todo
      console.debug('woohoo, you finished a level')
    })

    $(orb).on('collision', function(evt, data) {
      // TODO: move this to an onCollide function
      // this should be overridden by different roles of orbs
      // reverse direction!
      this.dir *= -1;
    })
  }
}

loopery.Orb.Roles.enemy = {
  init: function(orb) {
    $(orb).on('collision', function(evt, data) {
      console.debug("Enemy orb collided with:", data)
    })
  }
}