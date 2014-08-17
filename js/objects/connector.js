loopery.Connector = function(data, canvas_context, lookup_func) {

  this.id = data.id;

  // set loop endpoints
  this.loops = [
    {
      id: data.loop1,
      pos: data.pos1,
      wind: data.wind1
    },
    {
      id: data.loop2,
      pos: data.pos2,
      wind: data.wind2
    }
  ]

  this.ctx = canvas_context;
  this.lookup = lookup_func;

  // TODO: SERIOUSLY STOP USING THESE STUPIDLY REDUNDANT THINGS
  // (the 'wind' values make these redundant)
  this.subtype = data.in ? 'in' : 'out';
  if (data.in) {
    this.which_inner = data.which;
  }
  else {
    this.which_outer = data.which;
  }

  this.getData = function() {
    return {
      id: this.id,
      loop1: this.loops[0].id,
      pos1: this.loops[0].pos,
      wind1: this.loops[0].wind,
      loop1: this.loops[1].id,
      pos2: this.loops[1].pos,
      wind2: this.loops[1].wind,

      // THESE ARE THE REDUNDANT THINGS THAT NEED TO NOT EXIST
      in: (this.subtype === 'in'),
      which: (this.subtype === 'in' ? this.which_inner : this.which_outer)
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
      this.lookup('loops', this.loops[0].id).getPosCoords(this.loops[0].pos),
      rth(this.length * pos, this.angle)
    );
  }


  this.recomputePlacement = function() {
    // TODO: refactor this, along with the getOuterTangents and getInnerTangents methods
    var loop1 = this.lookup('loops', this.loops[0].id);
    var loop2 = this.lookup('loops', this.loops[1].id);

    if (this.which_outer !== undefined) {
      var pts = loopery.getOuterTangents(loop1, loop2);
      this.loops[0].pos = pts[this.which_outer][0];
      this.loops[1].pos = pts[this.which_outer][1];
    }
    if (this.which_inner !== undefined) {
      // If this track was generated as an outer tangent, then regenerate it
      var pts = loopery.getInnerTangents(loop1, loop2);
      this.loops[0].pos = pts[this.which_inner][0];
      this.loops[1].pos = pts[this.which_inner][1];
    }
    
    var p1 = loop1.getPosCoords(this.loops[0].pos);
    var p2 = loop2.getPosCoords(this.loops[1].pos);
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

  console.log('About to recompute linear track placement')
  this.recomputePlacement();


}
