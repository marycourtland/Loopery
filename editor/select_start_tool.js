// *********************************************************************
// Tool to select the starting circle track
game.editor.select_start_tool = {};

// Resets the tool (called when player chooses the tool)
game.editor.select_start_tool.start = function() {
  this.current_state = "start";
  game.display.shade_hovered_circle_track = true;
  game.display.shade_start_end_tracks = true;
}

game.editor.select_start_tool.end = function() {
  game.display.shade_hovered_circle_track = false;
  game.display.shade_start_end_tracks = false;
}

// Tool states
game.editor.select_start_tool.states = {
  start: {
    onenter: function() {},
    draw: function() {},
    onleave: function() {
      if (game.clicked_tracks.length > 0) {
        // A track has been selected
        game.editor.custom_level.setStart(game.clicked_tracks[0]);
      }
    },
    next_state: "start"
  }
}
