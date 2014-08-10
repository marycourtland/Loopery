// *********************************************************************
// Tool to delete things

game.editor.delete_tool = {};

// Resets the tool (called when player chooses the tool)
game.editor.delete_tool.start = function() {
  this.current_state = "start";
  game.display.shade_hovered_circle_track = true;
  game.display.shade_hovered_line_track = true;
}

game.editor.delete_tool.end = function() {
  game.display.shade_hovered_circle_track = false;
  game.display.shade_hovered_line_track = false;
}

game.editor.delete_tool.drawCursor = function() {
  // Draw an X to remind people that they're deleting things
  // TODO: make sure it draws itself over the track
  line(game.ctx, add(game.mouse.pos, xy(-7, -10)), add (game.mouse.pos, xy(3, 0)), 'white', 3)
  line(game.ctx, add(game.mouse.pos, xy(3, -10)), add (game.mouse.pos, xy(-7, 0)), 'white', 3)
}


// Tool states
game.editor.delete_tool.states = {
  start: {
    onenter: function() {},
    draw: function() {
      game.editor.delete_tool.drawCursor();
    },
    onleave: function() {
      // If a track was clicked, then delete it
      if (game.clicked_tracks.length > 0) {
        delete game.editor.custom_level.tracks[game.clicked_tracks[0].id]
        game.clicked_tracks[0].delete();
      }
    },
    next_state: "start"
  },
}
