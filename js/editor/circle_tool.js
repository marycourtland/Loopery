// *********************************************************************
// Tool to create circular tracks
game.editor.circle_tool = {};

// Params needed to create a circular track
game.editor.circle_tool.params = {
  center_pos: null,
  radius: null
}

// Creates a circular track based on the input params
game.editor.circle_tool.complete = function() {
  if (this.params.center_pos === null || this.params.radius === null) return;
  
  // Make the track
  var track = makeCircleTrack(game.editor.custom_level, this.params.center_pos, this.params.radius); 
  game.orderObjects();
  
  // Reset the params
  this.params.center_pos = null;
  this.params.radius = null;
}

// Resets the tool (called when player chooses the tool)
game.editor.circle_tool.start = function() {
  this.current_state = "choose_center";
  this.params.center_pos = null;
  this.params.radius = null;
}

game.editor.circle_tool.end = function() {
  this.params.center_pos = null;
  this.params.radius = null;
}

// Tool states
game.editor.circle_tool.states = {
  choose_center: {
    onenter: function() {},
    
    draw: function() {
      var pos = mouse.pos.copy();
      if (game.editor.snap_to_grid) { snapToGrid(pos, game.editor.gridsize); }
      draw.circle(game.ctx, pos, game.display.track_width/2, game.display.track_color);
    },
    
    onleave: function() {
      var pos = mouse.pos.copy();
      if (game.editor.snap_to_grid) { snapToGrid(pos, game.editor.gridsize); }
      game.editor.circle_tool.params.center_pos = pos;
    },
    next_state: "choose_edge"
  },
  
  choose_edge: {
    onenter: function() {},
    
    draw: function() {
      var pos = mouse.pos.copy();
      if (game.editor.snap_to_grid) { snapToGrid(pos, game.editor.gridsize); }
      
      emptyCircle(game.ctx,
        game.editor.circle_tool.params.center_pos,
        distance(pos, game.editor.circle_tool.params.center_pos),
        game.display.track_color,
        game.display.track_width
      );
    },
    
    onleave: function() {
      var pos = mouse.pos.copy();
      if (game.editor.snap_to_grid) { snapToGrid(pos, game.editor.gridsize); }
      game.editor.circle_tool.params.radius = distance(pos, game.editor.circle_tool.params.center_pos);
      game.editor.circle_tool.complete();
    },
    
    next_state: "choose_center"
  }
}
