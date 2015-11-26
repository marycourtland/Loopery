loopery.Orb = function(id, canvas_context, lookup_func) {
  this.group = 'orbs';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.init = function(data) {
    this.color = data.color || 'white';
    this.start = data.start;
    this.start_dir = data.start_dir;
    this.start_pos = data.start_pos;
    this.roles = data.roles;

    // apply roles
    for (var role in this.roles) {
      loopery.Orb.Roles[role].init(this);
    }

    // dynamic things
    this.reset();
  }

  this.reset = function() {
    this.oldpos = null;
    this.track = this.lookup({id: this.start});
    this.dir = this.start_dir;
    this.pos = this.start_pos;
    this.killed = false;

    for (var role in this.roles) {
      if (typeof loopery.Orb.Roles[role].reset === 'function') {
        loopery.Orb.Roles[role].reset(this);
      }
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


  this.kill = function() {
    $(this).trigger('tick');
    $(this).trigger('draw');
    this.killed = true;

    // trigger a death animation
    this.makeDeathAnimation();
  }

  this.makeDeathAnimation = function() {
    var n = 30;
    var pieces = [];
    for (var i=0; i<n; i++) {
        pieces.push(Math.random() * 2*Math.PI);
    }
    pieces.sort();

    // now group them in pairs
    var piece_pairs = [];
    while (pieces.length > 1) {
        piece_pairs.push(pieces.splice(0, 2));
    }

    // now setup the animation
    var loc = this.getLoc();
    var _this = this;
    var T = 100;

    // random bits of a circle
    (new Animation(T, function(frame) {
      piece_pairs.forEach(function(angle_pair) {
        draw.arc(_this.ctx, loc, loopery.display.orb_radius + 20*Math.log(frame), angle_pair[0], angle_pair[1], {
          fill: 'transparent',
          stroke: _this.color,
          lineWidth: loopery.display.orb_radius/frame
        });
      })
    })).start();
  }


  $(this).on('draw', function() {
    if (this.killed) { return; }
    draw.circle(this.ctx, this.track.getPosCoords(this.pos), loopery.display.orb_radius, {
      fill: this.color,
      stroke: this.color
    });
  });

  $(this).on('tick', function() {
    if (this.killed) { return; }
    // if (game.disable_gameplay) return;
    // if (this.disabled) return;

    this.move();

    // Detect collision
    var orbs = this.lookup({group: 'orbs'});
    for (var id in orbs) {
      if (orbs[id].killed) { return; }
      if (this.isCollidingWith(orbs[id])) { $(this).trigger('collision', {orb: orbs[id]}) }
    }

  });

}

// ORB ROLES

loopery.Orb.Roles = {};


loopery.Orb.Roles.player = {
  init: function(orb) {
    this.levelcomplete = false;

    // detect levelcomplete
    $(orb).on('tick', function() {
      if (this.killed) { return; }
      if (this.track.id === this.roles.player.end) { $(this).trigger('levelcomplete'); }
    })

    $(orb).on('draw', function() {
      if (this.levelcomplete) { return; }
      var end_track = this.lookup({group:'loops', id:this.roles.player.end});
      if (!end_track) { return; }

      drawGoalStar(end_track.loc, loopery.display.orb_radius * 2, loopery.state.frame / 100);
    })

    $(orb).on('levelcomplete', function(evt, data) {
      if (this.levelcomplete) { return; }
      this.levelcomplete = true;

      var end_track = this.lookup({group:'loops', id:this.roles.player.end});
      if (end_track) {
        showLevelCompleteAnimation(end_track.loc);
      }
    })

    function drawGoalStar(loc, r, th_offset, lineWidth, alpha) {
      lineWidth = (lineWidth !== undefined) ? lineWidth : 2;
      alpha = (alpha !== undefined) ? alpha : 1;
      var th = Math.PI / 3;
      var p1 = add(loc, rth(r, th_offset));
      var p2 = add(loc, rth(r, th_offset + th));
      var p3 = add(loc, rth(r, th_offset + 2 * th));
      var p4 = add(loc, rth(r, th_offset + 3 * th));
      var p5 = add(loc, rth(r, th_offset + 4 * th));
      var p6 = add(loc, rth(r, th_offset + 5 * th));

      var params = {stroke: orb.color, lineWidth:lineWidth, lineCap:'round', alpha:alpha};
      draw.line(orb.ctx, p1, p4, params);
      draw.line(orb.ctx, p2, p5, params);
      draw.line(orb.ctx, p3, p6, params);
    }

    function showLevelCompleteAnimation(loc) {
      var T = 120;
      var r0 = loopery.display.orb_radius * 2;
      (new Animation(T,
        function draw(frame) {
          var r =  r0 + 80*Math.log(frame);
          // var width = (1 + 1/(5*(frame - 30)));
          // var width = (frame < 5) ? 2 : 2 / (frame - 10);
          var width = 2;
          var alpha =  (frame < 20) ? 1 : Math.max(1-(frame/50), 0);
          drawGoalStar(loc, r0, loopery.state.frame / 5, width, alpha);
        },
        function end() {
          // todo: 'you win' message
        }
      )).start();
    }

    $(orb).on('collision', function(evt, data) {
      // reverse direction!
      this.dir *= -1;
    })
  }
}

loopery.Orb.Roles.clock = {
  init: function(orb) {
    orb.initial_track_angle = 0;  // the angle that the orb is moving (from the track)
    orb.initial_clock_angle = 0;        // the angle of the clock relative to the track angle
    orb.initial_clock_spin_rate = 0.05; // rad/tick

    $(orb).on('tick', function() {
      if (this.killed) { return; }
      // Calculate angles
      var loc1 = this.getLocFromPos(this.oldpos);
      var loc2 = this.getLocFromPos(this.pos);

      this.track_angle = subtract(loc2, loc1).th;
      this.clock_angle += this.clock_spin_rate;
    });

    $(orb).on('draw', function() {
      this.drawClockHand();

      if (this.roles.clock.tie_to_center) { this.drawTieLineTo(this.track.loc); }

      if (this.roles.clock.tied_orbs) {
        var _this = this;
        this.roles.clock.tied_orbs.forEach(function(orb_id) {
          _this.drawTieLineTo(_this.lookup({group: 'orbs', id: orb_id}));
        });
      }
    });

    orb.drawClockHand = function(target_pos) {
      var length_scale = this.roles.clock.length_scale || 1;
      var loc = this.getLoc();
      var clock_angle = this.track_angle + this.clock_angle + Math.PI/2;
      var clock_loc = add(loc, rth(loopery.display.orb_radius * length_scale, clock_angle));

      draw.line(this.ctx, loc, clock_loc, {
        stroke: this.roles.clock.color,
        lineWidth: 2
      });
    };

    orb.drawTieLineTo = function(target_loc) {
      // The line gets more visible when the clock hand is pointing towards the loop center
      var clock_angle = this.track_angle + this.clock_angle + Math.PI/2;
      var this_loc = this.getLoc();
      var orb_to_loop = subtract(target_loc, this_loc);
      var clock = rth(orb_to_loop.r, clock_angle);
      var visibility = 1 - subtract(orb_to_loop, clock).r / (2 * orb_to_loop.r); // normalize it from 0 to 1
      visibility = visibility * visibility;

      draw.line(this.ctx, this_loc, target_loc, {
        stroke: 'white',
        alpha: visibility,
        lineWidth:10
      })
    };
  },

  reset: function(orb) {
    // Dynamic things
    orb.track_angle = orb.initial_track_angle;
    orb.clock_angle = orb.initial_clock_angle;
    orb.clock_spin_rate = orb.initial_clock_spin_rate;
  }
}


loopery.Orb.Roles.enemy = {
  init: function(orb) {
    $(orb).on('collision', function(evt, data) {
      data.orb.kill();
    })

    $(orb).on('draw', function() {
      if (this.killed) return;
      loopery.Orb.Roles.enemy.drawSpikes(this);
    });
  },

  drawSpikes: function(orb) {
    var r = 0.3; // ratio of the spike length to orb radius
    var w = 0.03; // ratio of the spike width to the complete circle
    var n = 12; // number of spikes
    var th0 = loopery.state.frame % (2*Math.PI); // have the spikes spin a bit

    for (var i = 0; i < n; i++) {
      var th = i * 2*Math.PI / n;
      var p0 = rth(loopery.display.orb_radius, th + th0);
      var p1 = rotate(p0, w*2*Math.PI);
      //var p2 = rotate(p0, -w*2*Math.PI);
      var p3 = p0.copy().scale(1 + r);
      var loc = orb.getLoc();
      draw.polygon(orb.ctx, [
        p1.add(loc),
        p0.add(loc),
        p3.add(loc)
      ], {
        fill: orb.color,
        stroke: orb.color
      })
    }
  }
}
