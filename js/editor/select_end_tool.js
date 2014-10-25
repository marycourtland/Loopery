// *********************************************************************
// Tool to select the ending circle track
loopery.editor.select_end_tool = {};

// Resets the tool (called when player chooses the tool)
loopery.editor.select_end_tool.start = function() {
  this.current_state = "start";
  loopery.display.shade_hovered_circle_track = true;
  loopery.display.shade_start_end_tracks = true;
}

loopery.editor.select_end_tool.end = function() {
  loopery.display.shade_hovered_circle_track = false;
  loopery.display.shade_start_end_tracks = false;
}

// Tool states
loopery.editor.select_end_tool.states = {
  start: {
    onenter: function() {},
    draw: function() {},
    onleave: function() {
      if (loopery.clicked_tracks.length > 0) {
        // A track has been selected
        loopery.editor.custom_level.setEnd(loopery.clicked_tracks[0]);
      }
    },
    next_state: "start"
  }
}
