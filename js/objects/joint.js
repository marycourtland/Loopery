loopery.Joint = function(id, canvas_context, lookup_func) {
  this.obj_type = 'joint';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.init = function(data) {
    this.loop = this.lookup(data.loop, 'loops');
    this.connector = this.lookup(data.connector, 'connectors');
    this.winding = data.winding;
    this.initially_on = data.on;
    this.on = this.initially_on;

    // Position on loop; this will be set by connector
    this.pos = null;
  }

  this.getData = function() {
    return {
      id: this.id,
      loop: this.loop.id,
      connector: this.connector.id,
      winding: this.winding,
      on: this.initially_on
    }
  }

  this.tick = function() {
    // Transfer any orb which is on this joint
    // TODO: maybe there's an easier way for this joint to have access to orbs
    // or, even better, to know which orbs are on its relevant tracks

    for (var orb_id in loopery.gameplay.levelObjects.orbs) {
      var orb = loopery.gameplay.levelObjects.orbs[orb_id];
      this.attemptTransfer(orb);
    }    
  }

  this.attemptTransfer = function(orb) {
    if (orb.oldpos === null) { return; } // in this case, the orb hasn't moved yet

    // Check for transfer from loop to connector
    if (orb.track.id === this.loop.id) {

      // Don't do loop>connector transfers if the joint is turned off
      if (!this.on) { return; }

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
    return this.loop.getPosCoords(this.pos);
  }


  this.draw = function() {
    this.drawClicker();
  }

  this.drawClicker = function() {
    var loc = this.getLoc();
    if (!loc) {return; }
    draw.circle(this.ctx, loc, loopery.joint_click_radius, {
      fill: loopery.display.joint_click_color,
      alpha: loopery.display.joint_click_alpha
    });
  }

  this.contains = function(loc) {
    return distance(loc, this.getLoc() < loopery.joint_click_radius)
  }

}

