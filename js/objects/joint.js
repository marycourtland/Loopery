loopery.Joint = function(id, canvas_context, lookup_func) {
  this.group = 'joints';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.init = function(data, parent) {
    this.loop = this.lookup({id:data.loop, group:'loops'});
    this.connector = parent;
    this.winding = data.winding;
    this.initial_state = data.state;
    this.reset();

    this.turn_off_after_use = true; // currently this feature isn't implemented

    // Position on loop; this will be set by connector
    this.pos = null;

    this.enabled = true;
  }

  this.reset = function() {
    this.state = this.initial_state;
    this.setupCanvas();
  }

  this.getData = function() {
    return {
      id: this.id,
      loop: this.loop.id,
      connector: this.connector.id,
      winding: this.winding,
      state: this.initial_state
    }
  }

  this.setupCanvas = function() {
    if (this.$canvas) {
      this.$canvas.remove();
    }
    this.canvas = loopery.requestCanvas(xy(60, 60));
    this.$canvas = $(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    var _this = this;
    loopery.onNextTick(function() {
      _this.redrawCanvasRepr();
    })
  }

  $(this).on('tick', function() {
    // Transfer any orb which is on this joint
    // TODO: maybe there's an easier way for this joint to have access to orbs
    // or, even better, to know which orbs are on its relevant tracks
    for (var orb_id in loopery.gameplay.levelObjects.orbs) {
      var orb = loopery.gameplay.levelObjects.orbs[orb_id];
      this.attemptTransfer(orb);
    }
  });

  $(this).on('erase', function() {
    // todo: this could be cached or something - it gets calculated multiple times per loop
    var proximity_scale = this.getProximityScale(distance(this.getLoc(), loopery.mouse.pos));

    if (proximity_scale > 1) {
      draw.clear(this.ctx)
    }
  });

  $(this).on('draw', function() {
    if (!this.enabled) { return; }
    // this.drawArrowClicker();

    var proximity_scale = this.getProximityScale(distance(this.getLoc(), loopery.mouse.pos));

    if (proximity_scale > 1) {
      this.redrawCanvasRepr();
      if (this.contains(loopery.mouse.pos)) {
        loopery.showPointer();
      }
    }
  });

  this.redrawCanvasRepr = function() {
    var loc = this.getLoc();
    this.canvas.setPosition(loc);
    draw.clear(this.ctx);
    if (!this.enabled) { return; }

    this.drawArrowClicker();
  }

  this.bindEvents = function() {
    this.on('click', function(pos) {
      if (!this.enabled) { return; }
      this.toggle();
    })
  }

  // allow player to toggle the joint
  this.enable = function() {
    this.enabled = true;
    this.redrawCanvasRepr();
  }

  // prevent player from toggling the joint
  this.disable = function() {
    this.enabled = false;
    this.redrawCanvasRepr();
  }

  this.toggle = function() {
    this.state = !this.state;
    loopery.state.redraw_bg = true;

    // sound effect
    if (this.state === true) loopery.sound.play('joint');
  }

  this.attemptTransfer = function(orb) {
    if (orb.oldpos === null) { return; } // in this case, the orb hasn't moved yet

    // Check for transfer from loop to connector
    if (orb.track.id === this.loop.id) {

      // Don't do loop>connector transfers if the joint is turned off
      if (!this.state) { return; }

      // make sure orb is going in correct direction
      if (orb.dir !== this.winding) { return; }


      // Check if this.pos is between the orb's old and new pos
      if (!isBetweenOnCircle(this.pos, orb.oldpos, orb.pos, 1)) { return; }

      // OK, now make the transfer!
      this.transferOrbToConnector(orb);
    }

    // Check for transfer from connector to loop
    else if (orb.track.id === this.connector.id) {
      // Check if the orb has reached the correct end of the connector
      var connector_end = this.getConnectorEnd();
      if ((connector_end === 0 && orb.pos < 0) || (connector_end === 1 && orb.pos > 1)) {
        this.transferOrbToLoop(orb); // OK, now make the transfer!
      }
    }
  }

  this.transferOrbToLoop = function(orb) {
    var prev_loop = orb.prev_loop;
    orb.track = this.loop;
    orb.oldpos = null;
    orb.pos = this.pos;
    orb.dir = -this.winding;

    // See if the orb is stuck with no joints to click
    var new_joints = this.lookup({group:'joints', loop_id: this.loop.id}).filter(function(joint) { return joint.winding === orb.dir; });
    if (new_joints.length === 0) {
      $(orb).trigger('stuck');
    }
    
    // Disable all joints in the previous loop
    if (!!orb.roles.player) loopery.gameplay.disableJointsOnLoop(prev_loop);

    if (loopery.features.clickersOnlyOnPlayerLoops && orb.roles && orb.roles.player) {
      loopery.gameplay.initPlayerEnabledJoints();
    }

    if (this.turn_off_after_use) this.state = false; // disable joints immediately after they're used

    loopery.sound.stop('connector');
  }

  this.transferOrbToConnector = function(orb) {
    // var pos_diff = Math.abs(orb.pos - this.pos);
    var pos_diff = shortestDistanceOnCircle(this.pos, orb.pos, 1)
    orb.prev_loop = orb.track;
    orb.track = this.connector;
    orb.oldpos = null;
    orb.pos = (this.getConnectorEnd() === 0 ? pos_diff : 1 - pos_diff);
    orb.dir = (this.getConnectorEnd() === 0 ? 1 : -1);

    if (loopery.features.clickersOnlyOnPlayerLoops && orb.roles && orb.roles.player) {
      loopery.gameplay.initPlayerEnabledJoints();
    }

    if (this.turn_off_after_use) this.state = false; // turn off joints immediately after they're used

    loopery.sound.start('connector');
  }

  this.getConnectorEnd = function() {
    return this.connector.joints.indexOf(this);
  }

  this.getLoc = function() {
    // todo: cache this value
    var dir = this.connector.joints[0] === this ? 1 : -1;
    var offset = rth(dir * loopery.joint_click_distance, this.connector.geometry.angle);
    return add(this.loop.getPosCoords(this.pos), offset);
  }

  this.drawCircleClicker = function() {
    var loc = this.getLoc();
    if (!loc) { return; }
    var alpha = this.getAlpha();
    draw.circle(this.ctx, loc, loopery.joint_click_radius, {
      fill: loopery.display.joint_click_color,
      alpha: alpha,
      stroke: 'transparent'
    });
  }

  this.drawArrowClicker = function() {
    this.drawArrowClickerScaled(this.getProximityScale(distance(this.getLoc(), loopery.mouse.pos)));
  }

  this.drawArrowClickerScaled = function(scale) {
    // draw arrow
    var w = loopery.joint_click_radius * 0.8 * scale;
    // var w = loopery.display.track_width * 2;
    var dir = this.connector.joints[0] === this ? 1 : -1;
    var p1 = rth(dir * w, this.connector.geometry.angle);
    var p2 = rotate(p1, Math.PI/2).scale(1/2);
    var p3 = rth(dir * 2, this.connector.geometry.angle);
    var p4 = rotate(p1, -Math.PI/2).scale(1/2);

    draw.polygon(this.ctx, [ p1, p2, p3, p4 ],
      {
        fill: this.state ? 'white' : 'black',
        stroke: 'white',
        lineWidth: 2
      }
    )
  }

  this.getAlpha = function() {
    if (loopery.features.clickerDisplay === 'pulse-all')  {
      return this.contains(loopery.mouse.pos) ? loopery.display.joint_click_max_alpha : this.alphaPulse(loopery.state.frame); 
    }

    if (loopery.features.clickerDisplay === 'show-when-mouse-is-near')  {
      return this.alphaMouse(distance(this.getLoc(), loopery.mouse.pos));
    }

    else {
      return loopery.display.joint_click_max_alpha;
    }
  }


  this.alphaMouse = function(mouse_distance) {
    return loopery.display.joint_click_max_alpha * Math.exp(-(mouse_distance * mouse_distance) / (50 * loopery.display.joint_click_mouse_distance))
  }

  this.alphaPulse = oscillator(loopery.display.joint_click_pulse_period, 0, loopery.display.joint_click_max_alpha);

  this.getProximityScale = function(mouse_distance) {
    // decide how large the clicker should be drawn based on how close the given position is
    if (mouse_distance > loopery.display.joint_click_mouse_distance) { return 1; }
    return 1 + (1 - mouse_distance/loopery.display.joint_click_mouse_distance);
  }

  this.contains = function(loc) {
    if (!this.enabled) { return false; }
    return distance(loc, this.getLoc()) < loopery.joint_click_radius
  }
}
