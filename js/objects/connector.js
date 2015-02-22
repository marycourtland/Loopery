loopery.Connector = function(id, canvas_context, lookup_func) {
  this.obj_type = 'connector';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.init = function(data) {
    // set joints
    this.joints = [
      this.lookup({id:data.joint1, group:"joints"}),
      this.lookup({id:data.joint2, group:"joints"})
    ]

    // cache this stuff so it doesn't have to be recomputed at each frame
    this.geometry = {
      pos1: null,
      pos2: null,
      length: null,
      angle: null
    }

    this.recomputePlacement();
  }


  this.getData = function() {
    return {
      id: this.id,
      joint1: this.joints[0].id,
      joint2: this.joints[1].id
    }
  }

  this.tick = function() {}
  $(this).on('tick', function() {})

  $(this).on('draw', function() {
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
    var dark_end1 = !this.joints[0].state;
    var dark_end2 = !this.joints[1].state;
    
    // Neither ends are darkened
    if (!(dark_end1 || dark_end2)) {
      draw.line(this.ctx, p1, p4, {stroke: color, lineWidth: loopery.display.track_width});
    }
    
    // Only first end is darkened
    if (dark_end1 && !dark_end2) {
      draw.lineGradient(this.ctx, p1, p2a, 'black', color, {lineWidth: loopery.display.track_width});
      draw.line(this.ctx, p2b, p4, {stroke: color, lineWidth: loopery.display.track_width});
    }
    
    // Only second end is darkened
    if (!dark_end1 && dark_end2) {
      draw.line(this.ctx, p1, p3b, {stroke: color, lineWidth: loopery.display.track_width});
      draw.lineGradient(this.ctx, p4, p3a, 'black', color, {lineWidth: loopery.display.track_width});
    }
    
    // Both ends are darkened
    if (dark_end1 && dark_end2) {
      draw.lineGradient(this.ctx, p1, p2a, 'black', color, {lineWidth: loopery.display.track_width});
      draw.line(this.ctx, p2b, p3b, {stroke: color, lineWidth: loopery.display.track_width});
      draw.lineGradient(this.ctx, p4, p3a, 'black', color, {lineWidth: loopery.display.track_width});
    }
    
    if (loopery.display.shade_hovered_line_track && this.contains(game.mouse.pos)) {
      this.shade();
    }
  });


  this.getPosCoords = function(pos) {
    return add(
      this.joints[0].loop.getPosCoords(this.joints[0].pos),
      rth(this.geometry.length * pos, this.geometry.angle)
    );
  }

   this.getNextPos = function(old_pos, dir, speed) {
    return old_pos + dir * speed / this.geometry.length;
  }


  this.recomputePlacement = function() {
    var loop1 = this.joints[0].loop;
    var loop2 = this.joints[1].loop;

    var wind1 = this.joints[0].winding;
    var wind2 = this.joints[1].winding;

    var tangentData = loopery.getTangent(loop1, loop2, wind1, wind2);

    var p1 = tangentData.origin;
    var p2 = add(tangentData.origin, tangentData.vector);

    this.joints[0].pos = this.joints[0].loop.getPosFromLoc(p1);
    this.joints[1].pos = this.joints[1].loop.getPosFromLoc(p2);

    // Compute this connector's length/angle from the absolute positions
    this.geometry.angle = subtract(p2, p1).th;
    this.geometry.length = subtract(p2, p1).r;
    
    // TODO: move this clicker code to Joint object when ready
    if (this.clicker1 && this.clicker2) {
      this.clicker1.pos = this.getPosCoords(loopery.display.clicker_offset);
      this.clicker2.pos = this.getPosCoords(1 - loopery.display.clicker_offset);
      this.clicker1.pos = add(this.getPosCoords(0), rth(game.joint_click_distance, this.geometry.angle));
      this.clicker2.pos = add(this.getPosCoords(1), rth(-game.joint_click_distance, this.geometry.angle));
    }
  }
}
