// *********************************************************************
// Tool to delete things

game.editor.delete_tool = {};

// Resets the tool (called when player chooses the tool)
game.editor.delete_tool.start = function() {
  this.current_state = "start";
  game.display.shade_hovered_circle_track = true;
}

game.editor.delete_tool.end = function() {
  game.display.shade_hovered_circle_track = false;
}

// Tool states
game.editor.delete_tool.states = {
  start: {
    onenter: function() {},
    draw: function() {},
    onleave: function() {},
    next_state: "start"
  },
}
