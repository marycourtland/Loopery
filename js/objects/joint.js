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

    // Position on loop; this will be set by connector
    this.pos = null;

    this.enabled = true;
  }

  this.reset = function() {
    this.state = this.initial_state;
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

  $(this).on('tick', function() {
    // Transfer any orb which is on this joint
    // TODO: maybe there's an easier way for this joint to have access to orbs
    // or, even better, to know which orbs are on its relevant tracks
    for (var orb_id in loopery.gameplay.levelObjects.orbs) {
      var orb = loopery.gameplay.levelObjects.orbs[orb_id];
      this.attemptTransfer(orb);
    }

  });

  $(this).on('draw', function() {
    if (!this.enabled) { return; }
    this.drawArrowClicker();

    if (this.contains(loopery.mouse.pos)) {
      loopery.showPointer();
    }
  });


  this.bindEvents = function() {
    this.on('click', function(pos) {
      if (!this.enabled) { return; }
      this.toggle();
    })
  }

  // allow player to toggle the joint
  this.enable = function() {
    this.enabled = true;
  }

  // prevemt player from toggling the joint
  this.disable = function() {
    this.enabled = false;
  }

  this.toggle = function() {
    this.state = !this.state;
    loopery.state.redraw_bg = true;
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
    orb.track = this.loop;
    orb.oldpos = null;
    orb.pos = this.pos;
    orb.dir = -this.winding;

    if (loopery.features.clickersOnlyOnPlayerLoops && orb.roles.player) {
      // When a player orb switches loops, we need to enable the joints on the new loop, etc.
      // Todo: this could be optimized a tiny bit by disabling/enabling only joints that need changing.s
      // (instead of disabling all of them and re-enabling all relevante ones)
      loopery.gameplay.initPlayerEnabledJoints();
    }
  }

  this.transferOrbToConnector = function(orb) {
    // var pos_diff = Math.abs(orb.pos - this.pos);
    var pos_diff = shortestDistanceOnCircle(this.pos, orb.pos, 1)
    orb.track = this.connector;
    orb.oldpos = null;
    orb.pos = (this.getConnectorEnd() === 0 ? pos_diff : 1 - pos_diff);
    orb.dir = (this.getConnectorEnd() === 0 ? 1 : -1);
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
    // draw arrow
    var loc = this.getLoc();
    if (!loc) { return; }
    var w = loopery.joint_click_radius * 0.8;
    // var w = loopery.display.track_width * 2;
    var dir = this.connector.joints[0] === this ? 1 : -1;
    var p1 = rth(dir * w, this.connector.geometry.angle);
    var p2 = rotate(p1, Math.PI/2).scale(1/2);
    var p3 = rth(dir * 2, this.connector.geometry.angle);
    var p4 = rotate(p1, -Math.PI/2).scale(1/2);
    draw.polygon(this.ctx, [
        add(loc, p1),
        add(loc, p2),
        add(loc, p3),
        add(loc, p4),
      ],
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

  this.contains = function(loc) {
    if (!this.enabled) { return false; }
    return distance(loc, this.getLoc()) < loopery.joint_click_radius
  }
}
