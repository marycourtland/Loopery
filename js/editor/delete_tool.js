// *********************************************************************
// Tool to delete things

loopery.editor.delete_tool = {};

// Resets the tool (called when player chooses the tool)
loopery.editor.delete_tool.start = function() {
  this.current_state = "start";
  loopery.display.shade_hovered_circle_track = true;
  loopery.display.shade_hovered_line_track = true;
}

loopery.editor.delete_tool.end = function() {
  loopery.display.shade_hovered_circle_track = false;
  loopery.display.shade_hovered_line_track = false;
}

loopery.editor.delete_tool.drawCursor = function() {
  // Draw an X to remind people that they're deleting things
  // TODO: make sure it draws itself over the track
  draw.line(loopery.ctx, add(loopery.mouse.pos, xy(-7, -10)), add(loopery.mouse.pos, xy(3, 0)), {
    stroke:'white',
    linewidth: 3
  })
  draw.line(loopery.ctx, add(loopery.mouse.pos, xy(3, -10)), add(loopery.mouse.pos, xy(-7, 0)), {
    stroke:'white',
    linewidth: 3
  })
}


// Tool states
loopery.editor.delete_tool.states = {
  start: {
    onenter: function() {},
    draw: function() {
      loopery.editor.delete_tool.drawCursor();
    },
    onleave: function() {
      // If a track was clicked, then delete it
      if (loopery.clicked_tracks.length > 0) {
        delete loopery.editor.custom_level.tracks[loopery.clicked_tracks[0].id]
        loopery.clicked_tracks[0].delete();
      }
    },
    next_state: "start"
  },
}
