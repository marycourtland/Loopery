// *********************************************************************
// Tool to select/edit things
game.editor.select_tool = {};

// Resets the tool (called when player chooses the tool)
game.editor.select_tool.start = function() {
  this.current_state = "start";
  game.display.shade_hovered_circle_track = true;
}

game.editor.select_tool.end = function() {
  game.display.shade_hovered_circle_track = false;
}

// Tool states
game.editor.select_tool.states = {
  start: {
    onenter: function() {},
    draw: function() {},
    onleave: function() {},
    next_state: "start"
  },
}
