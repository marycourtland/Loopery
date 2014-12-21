// *********************************************************************
// Tool to select/edit things
loopery.editor.select_tool = {};

loopery.editor.select_tool.params = {
  selected_track: null
}

// A little resizing handle object that allows the person to change radius of a circle track
loopery.editor.select_tool.resizer = new GameObject(loopery);
loopery.editor.select_tool.resizer.type = 'resizer';
loopery.editor.select_tool.resizer.radius = loopery.display.track_width * 1.5;

loopery.editor.select_tool.resizer.contains = function(pos) {
  return distance(pos, this.pos) < this.radius;
}

loopery.editor.select_tool.resizer.tick = function() {
  if (!loopery.editor.select_tool.params.selected_track) { return; }
  
  var track_center = loopery.editor.select_tool.params.selected_track.loc;

  if (this.dragging) {
    this.pos = loopery.mouse.pos.copy();
    if (loopery.editor.snap_to_grid) { snapToGrid(this.pos, loopery.editor.gridsize); }
    loopery.editor.select_tool.params.selected_track.radius = distance(this.pos, track_center);
  }
  else {
    // Put the handle on the relevant circle track, but in the spot closest to the mouse
    var track_radius = loopery.editor.select_tool.params.selected_track.radius;
    var angle_to_mouse = subtract(loopery.mouse.pos, track_center).th;
    this.pos = add(track_center, rth(track_radius, angle_to_mouse));
  }
  
  this.dragging = false;
};


loopery.editor.select_tool.resizer.draw = function() {
  if (!loopery.editor.select_tool.params.selected_track) { return; }
  draw.circle(loopery.ctx, this.pos, this.radius, {
    fill: loopery.display.track_color,
    linewidth: 0,
    stroke:'white'
  })
};

loopery.gameplay.configObjectEvents(loopery.editor.select_tool.resizer);

loopery.editor.select_tool.resizer.on('drag', function() { this.dragging = true; });

  

// Resets the tool (called when player chooses the tool)
loopery.editor.select_tool.start = function() {
  this.current_state = "default_state";
  loopery.display.shade_hovered_circle_track = true;
  loopery.editor.select_tool.params.selected_track = null;
  loopery.gameplay.forAllObjectsInGroup('loops', loopery.editor.select_tool.configLoopEvents);
}

loopery.editor.select_tool.end = function() {
  loopery.display.shade_hovered_circle_track = false;
  loopery.editor.select_tool.params.selected_track = null;
  loopery.gameplay.forAllObjectsInGroup(loopery.editor.select_tool.removeLoopEvents);
}

loopery.editor.select_tool.configLoopEvents = function(loop) {
  // meh
  loop.on('mousedown', function() {
    loopery.editor.select_tool.params.selected_track = this;
  })
  loop.on('drag', function(pos, vel) {
    loopery.editor.select_tool.params.selected_track = this;
    loop.loc.add(vel);
  })
}

loopery.editor.select_tool.removeLoopEvents = function(loop) {
  // todo
}

// Tool states
loopery.editor.select_tool.states = {
  default_state: {
    onenter: function() {},
    tick: function() {
      loopery.editor.select_tool.resizer.tick();
    },
    draw: function() {
      if (loopery.editor.select_tool.params.selected_track) {
        loopery.editor.select_tool.resizer.draw();
        loopery.editor.select_tool.params.selected_track.show_shade = true;
      }
    },
    onleave: function() {
    },
    next_state: "default_state"
  }
}
