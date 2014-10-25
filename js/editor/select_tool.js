// *********************************************************************
// Tool to select/edit things
loopery.editor.select_tool = {};

loopery.editor.select_tool.params = {
  selected_track: null
}

// A little resizing handle object that allow the person to change radius of a circle track
loopery.editor.select_tool.resizer = new GameObject(loopery);
loopery.editor.select_tool.resizer.type = 'resizer';
loopery.editor.select_tool.resizer.radius = loopery.display.track_width * 1.5;

loopery.editor.select_tool.resizer.contains = function(pos) {
  return distance(pos, this.pos) < this.radius;
}

loopery.editor.select_tool.resizer.ondrag = function() { this.dragging = true; }

loopery.editor.select_tool.resizer.tickActions.push(function() {
  if (!loopery.editor.select_tool.params.selected_track) { return; }
  
  var track_center = loopery.editor.select_tool.params.selected_track.pos;

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
});


loopery.editor.select_tool.resizer.drawActions.push(function() {
  if (!loopery.editor.select_tool.params.selected_track) { return; }
  
  draw.circle(loopery.ctx, this.pos, this.radius, loopery.display.track_color)
  
});

  

// Resets the tool (called when player chooses the tool)
loopery.editor.select_tool.start = function() {
  this.current_state = "nothing_is_selected";
  loopery.display.shade_hovered_circle_track = true;
  loopery.editor.select_tool.params.selected_track = null;
}

loopery.editor.select_tool.end = function() {
  loopery.display.shade_hovered_circle_track = false;
  loopery.editor.select_tool.params.selected_track = null;
}

// Tool states
loopery.editor.select_tool.states = {
  nothing_is_selected: {
    onenter: function() {},
    draw: function() {},
    onleave: function() { 
      if (loopery.clicked_tracks.length > 0) {
        // A track has been selected
        loopery.editor.select_tool.params.selected_track = loopery.clicked_tracks[0];
        loopery.editor.select_tool.states.nothing_is_selected.next_state = "track_is_selected";
      }
      else {
        // Repeat this state if track hasn't been selected
        loopery.editor.select_tool.params.selected_track = null;
        loopery.editor.select_tool.states.nothing_is_selected.next_state = "nothing_is_selected";
      }
    },
    next_state: "track_is_selected"
  },
  track_is_selected: {
    onenter: function() {},
    draw: function() {
      loopery.editor.select_tool.params.selected_track.show_shade = true;
    },
    onleave: function() {
      if (loopery.clicked_tracks.length > 0) {
        // A different track has been selected - repeat this state
        loopery.editor.select_tool.params.selected_track = loopery.clicked_tracks[0];
      }
      else {
        // Just a random click
      }
    },
    next_state: "track_is_selected"
  },
}
