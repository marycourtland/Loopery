// *********************************************************************
// Tool to test the level
loopery.editor.test_level_tool = {};

// Resets the tool (called when player chooses the tool)
loopery.editor.test_level_tool.start = function() {
  this.current_state = "start";
  loopery.display.shade_hovered_circle_track = true;
  loopery.display.shade_start_end_tracks = true;
  loopery.disable_gameplay = false;
  loopery.startCurrentLevel();
}

loopery.editor.test_level_tool.end = function() {
  loopery.display.shade_hovered_circle_track = false;
  loopery.display.shade_start_end_tracks = false;
  loopery.disable_gameplay = true;
}

// Tool states
loopery.editor.test_level_tool.states = {
  start: {
    onenter: function() {},
    draw: function() {},
    onleave: function() {},
    next_state: "start"
  }
}
