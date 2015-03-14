loopery.Orb = function(id, canvas_context, lookup_func) {
  this.group = 'orbs';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.init = function(data) {
    this.color = data.color || 'white';
    this.start = data.start;
    this.start_dir = data.start_dir;
    this.roles = data.roles;

    // dynamic things
    this.oldpos = null;
    this.pos = data.start_pos || 0.5;
    this.track = this.lookup({id: data.start});
    this.dir = this.start_dir;

    // apply roles
    for (var role in this.roles) {
      loopery.Orb.Roles[role].init(this);
    }
  }

  this.getData = function() {
    return {
      id: this.id,
      color: this.color,
      start: this.start,
      start_dir: this.start_dir,
      start_pos: this.start_pos,
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


  this.destroy = function() {
    this.destroyed = true;
    $(this).trigger('tick');
    $(this).trigger('draw');
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

  });

}

// ORB ROLES

loopery.Orb.Roles = {};


loopery.Orb.Roles.player = {
  init: function(orb) {
    // detect levelcomplete
    $(orb).on('tick', function() {
      if (this.track.id === this.roles.player.end) { $(this).trigger('levelcomplete'); }
    })

    $(orb).on('levelcomplete', function(evt, data) {
      // todo
      console.debug('woohoo, you finished a level')
    })

    $(orb).on('collision', function(evt, data) {
      // reverse direction!
      this.dir *= -1;
    })
  }
}


loopery.Orb.Roles.enemy = {
  init: function(orb) {
    $(orb).on('collision', function(evt, data) {
      console.debug("Enemy orb collided with:", data)
      data.orb.destroy();
    })
  }
}