loopery.Connector = function(data, canvas_context, lookup_func) {

  this.id = data.id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  // set joints
  this.joints = [
    this.lookup("joints", data.joint1),
    this.lookup("joints", data.joint2)
  ]

  // cache this stuff so it doesn't have to be recomputed at each frame
  this.geometry = {
    pos1: null,
    pos2: null,
    length: null,
    angle: null
  }

  this.getData = function() {
    return {
      id: this.id,
      joint1: this.joints[0].id,
      joint2: this.joints[1].id
    }
  }

  this.tick = function() {}

  this.draw = function() {
    var color = loopery.display.track_color;
    var p1 = this.getPosCoords(0);
    var p2a = this.getPosCoords(loopery.display.darkened_track_extent);
    var p2b = this.getPosCoords(loopery.display.darkened_track_extent - 0.01);
    var p3a = this.getPosCoords(1 - loopery.display.darkened_track_extent);
    var p3b = this.getPosCoords(1 - loopery.display.darkened_track_extent + 0.01);
    var p4 = this.getPosCoords(1);
    
    // Determine which ends to darken (based whether connections are on or off)
    // TODO: implement this with new Joint object
    // Alternatively, the Joint object could do the rendering of the darkened track
    // ...or tell this connector to render it
    var dark_end1 = true; //!this.track1.connections[this.id];
    var dark_end2 = true; //!this.track2.connections[this.id];
    
    // Neither ends are darkened
    if (!(dark_end1 || dark_end2)) {
      line(this.ctx, p1, p4, color, loopery.display.track_width);
    }
    
    // Only first end is darkened
    if (dark_end1 && !dark_end2) {
      lineGradient(this.ctx, p1, p2a, 'black', color, loopery.display.track_width);
      line(this.ctx, p2b, p4, color, loopery.display.track_width)
    }
    
    // Only second end is darkened
    if (!dark_end1 && dark_end2) {
      line(this.ctx, p1, p3b, color, loopery.display.track_width)
      lineGradient(this.ctx, p4, p3a, 'black', color, loopery.display.track_width);
    }
    
    // Both ends are darkened
    if (dark_end1 && dark_end2) {
      lineGradient(this.ctx, p1, p2a, 'black', color, loopery.display.track_width);
      line(this.ctx, p2b, p3b, color, loopery.display.track_width)
      lineGradient(this.ctx, p4, p3a, 'black', color, loopery.display.track_width);
    }
    
    if (loopery.display.shade_hovered_line_track && this.contains(game.mouse.pos)) {
      this.shade();
    }
  }


  this.getPosCoords = function(pos) {
    return add(
      this.joints[0].loop.getPosCoords(this.geometry.pos1),
      rth(this.length * pos, this.angle)
    );
  }


  this.recomputePlacement = function() {
    // TODO: refactor this, along with the getOuterTangents and getInnerTangents methods
    var loop1 = this.joints[0].loop;
    var loop2 = this.joints[1].loop;

    var wind1 = this.joints[0].winding;
    var wind2 = this.joints[1].winding;

    var which = (wind1 === 1) ? 0 : 1;

    window.l1 = loop1;
    window.l2 = loop2;

    // var loop1 = this.lookup('loops', this.loops[0].id);
    // var loop2 = this.lookup('loops', this.loops[1].id);

    // Compute endpoints (currently, the computations outputs the endpoints
    // as loop-based position)
    if (wind1 === wind2) {
      // If this track was generated as an outer tangent, then regenerate it
      var pts = loopery.getInnerTangents(loop1, loop2);
      this.geometry.pos1 = pts[which][0];
      this.geometry.pos2 = pts[which][1];
    }
    else {
      var pts = loopery.getOuterTangents(loop1, loop2);
      this.geometry.pos1 = pts[which][0];
      this.geometry.pos2 = pts[which][1];
    }
    
    // Grab the absolute coordinates of the endpoints
    var p1 = loop1.getPosCoords(this.geometry.pos1);
    var p2 = loop2.getPosCoords(this.geometry.pos2);

    // Compute this connector's length/angle from the absolute positions
    this.angle = subtract(p2, p1).th;
    this.length = subtract(p2, p1).r;
    
    // TODO: move this clicker code to Joint object when ready
    if (this.clicker1 && this.clicker2) {
      this.clicker1.pos = this.getPosCoords(loopery.display.clicker_offset);
      this.clicker2.pos = this.getPosCoords(1 - loopery.display.clicker_offset);
      this.clicker1.pos = add(this.getPosCoords(0), rth(game.joint_click_distance, this.angle));
      this.clicker2.pos = add(this.getPosCoords(1), rth(-game.joint_click_distance, this.angle));
    }
  }

  this.recomputePlacement();


}
