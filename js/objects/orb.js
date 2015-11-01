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
    this.pos = (typeof data.start_pos === 'number') ? data.start_pos : 0.5;
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

  this.getLocFromPos = function(pos) {
    return this.track.getPosCoords(pos);
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

loopery.Orb.Roles.arm = {
  init: function(orb) {
    orb.track_angle = 0;  // the angle that the orb is moving (from the track)
    orb.arm_angle = 0;        // the angle of the arm relative to the track angle
    orb.arm_spin_rate = 0.05; // rad/tick

    $(orb).on('tick', function() {
      // Calculate angles
      var loc1 = this.getLocFromPos(this.oldpos);
      var loc2 = this.getLocFromPos(this.pos);

      this.track_angle = subtract(loc2, loc1).th;
      this.arm_angle += this.arm_spin_rate;
    });

    $(orb).on('draw', function() {
      this.drawArm();

      if (this.roles.arm.tie_to_center) { this.drawTieLineTo(this.track.loc); }

      if (this.roles.arm.tied_orbs) {
        var _this = this;
        this.roles.arm.tied_orbs.forEach(function(orb_id) {
          _this.drawTieLineTo(_this.lookup({group: 'orbs', id: orb_id}).getLoc());
        });
      }
    });

    orb.drawArm = function(target_pos) {
      var length_scale = this.roles.arm.length_scale || 1;
      var loc = this.getLoc();
      var arm_angle = this.track_angle + this.arm_angle + Math.PI/2;
      var arm_loc = add(loc, rth(loopery.display.orb_radius * length_scale, arm_angle));

      draw.line(this.ctx, loc, arm_loc, {
        stroke: this.roles.arm.color,
        lineWidth: 2
      });
    };

    orb.drawTieLineTo = function(target_loc) {
      // The line gets more visible when the arm is pointing towards the loop center
      var arm_angle = this.track_angle + this.arm_angle + Math.PI/2;
      var this_loc = this.getLoc();
      var orb_to_loop = subtract(target_loc, this_loc);
      var arm = rth(orb_to_loop.r, arm_angle);
      var visibility = 1 - subtract(orb_to_loop, arm).r / (2 * orb_to_loop.r); // normalize it from 0 to 1
      visibility = visibility * visibility;

      draw.line(this.ctx, this_loc, target_loc, {
        stroke: 'white',
        alpha: visibility,
        lineWidth:10
      })
    };

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
