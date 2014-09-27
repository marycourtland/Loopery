// *********************************************************************
// Tool to select/edit things
game.editor.select_tool = {};

game.editor.select_tool.params = {
  selected_track: null
}

// A little resizing handle object that allow the person to change radius of a circle track
game.editor.select_tool.resizer = new GameObject(game);
game.editor.select_tool.resizer.type = 'resizer';
game.editor.select_tool.resizer.radius = game.display.track_width * 1.5;

game.editor.select_tool.resizer.contains = function(pos) {
  return distance(pos, this.pos) < this.radius;
}

game.editor.select_tool.resizer.ondrag = function() { this.dragging = true; }

game.editor.select_tool.resizer.tickActions.push(function() {
  if (!game.editor.select_tool.params.selected_track) { return; }
  
  var track_center = game.editor.select_tool.params.selected_track.pos;

  if (this.dragging) {
    this.pos = game.mouse.pos.copy();
    if (game.editor.snap_to_grid) { snapToGrid(this.pos, game.editor.gridsize); }
    game.editor.select_tool.params.selected_track.radius = distance(this.pos, track_center);
  }
  else {
    // Put the handle on the relevant circle track, but in the spot closest to the mouse
    var track_radius = game.editor.select_tool.params.selected_track.radius;
    var angle_to_mouse = subtract(game.mouse.pos, track_center).th;
    this.pos = add(track_center, rth(track_radius, angle_to_mouse));
  }
  
  this.dragging = false;
});


game.editor.select_tool.resizer.drawActions.push(function() {
  if (!game.editor.select_tool.params.selected_track) { return; }
  
  draw.circle(game.ctx, this.pos, this.radius, game.display.track_color)
  
});

  

// Resets the tool (called when player chooses the tool)
game.editor.select_tool.start = function() {
  this.current_state = "nothing_is_selected";
  game.display.shade_hovered_circle_track = true;
  game.editor.select_tool.params.selected_track = null;
}

game.editor.select_tool.end = function() {
  game.display.shade_hovered_circle_track = false;
  game.editor.select_tool.params.selected_track = null;
}

// Tool states
game.editor.select_tool.states = {
  nothing_is_selected: {
    onenter: function() {},
    draw: function() {},
    onleave: function() { 
      if (game.clicked_tracks.length > 0) {
        // A track has been selected
        game.editor.select_tool.params.selected_track = game.clicked_tracks[0];
        game.editor.select_tool.states.nothing_is_selected.next_state = "track_is_selected";
      }
      else {
        // Repeat this state if track hasn't been selected
        game.editor.select_tool.params.selected_track = null;
        game.editor.select_tool.states.nothing_is_selected.next_state = "nothing_is_selected";
      }
    },
    next_state: "track_is_selected"
  },
  track_is_selected: {
    onenter: function() {},
    draw: function() {
      game.editor.select_tool.params.selected_track.show_shade = true;
    },
    onleave: function() {
      if (game.clicked_tracks.length > 0) {
        // A different track has been selected - repeat this state
        game.editor.select_tool.params.selected_track = game.clicked_tracks[0];
      }
      else {
        // Just a random click
      }
    },
    next_state: "track_is_selected"
  },
}
