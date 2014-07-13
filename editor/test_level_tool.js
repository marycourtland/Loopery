// *********************************************************************
// Tool to test the level
game.editor.test_level_tool = {};

// Resets the tool (called when player chooses the tool)
game.editor.test_level_tool.start = function() {
  this.current_state = "start";
  game.display.shade_hovered_circle_track = true;
  game.display.shade_start_end_tracks = true;
  game.disable_gameplay = false;
  game.startCurrentLevel();
}

game.editor.test_level_tool.end = function() {
  game.display.shade_hovered_circle_track = false;
  game.display.shade_start_end_tracks = false;
  game.disable_gameplay = true;
}

// Tool states
game.editor.test_level_tool.states = {
  start: {
    onenter: function() {},
    draw: function() {},
    onleave: function() {},
    next_state: "start"
  }
}
