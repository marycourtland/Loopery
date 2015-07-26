// *********************************************************************
// Tool to create circular tracks
loopery.editor.circle_tool = {};

// Params needed to create a circular track
loopery.editor.circle_tool.params = {
  center_pos: null,
  radius: null
}

// Creates a circular track based on the input params
loopery.editor.circle_tool.complete = function() {
  if (this.params.center_pos === null || this.params.radius === null) return;
  
  // Make the track
  var track_data = {  
    id: loopery.editor.getNextId(),
    x: this.params.center_pos.x,
    y: this.params.center_pos.y,
    r: this.params.radius
  }
  var loop = loopery.gameplay.loadAndInitObject('loops', 'Loop', track_data);

  loop.on("click", function(loc) {
    loopery.editor.clicked_tracks.push(this);
  })
  
  // Reset the params
  this.params.center_pos = null;
  this.params.radius = null;
}

// Resets the tool (called when player chooses the tool)
loopery.editor.circle_tool.start = function() {
  this.current_state = "choose_center";
  this.params.center_pos = null;
  this.params.radius = null;
}

loopery.editor.circle_tool.end = function() {
  this.params.center_pos = null;
  this.params.radius = null;
}

// Tool states
loopery.editor.circle_tool.states = {
  choose_center: {
    onenter: function() {
    },
    
    draw: function() {
      var pos = loopery.mouse.pos.copy();
      if (loopery.editor.snap_to_grid) { snapToGrid(pos, loopery.editor.gridsize); }
      draw.circle(loopery.ctx, pos, loopery.display.track_width/2, loopery.display.track_color);
    },
    
    onleave: function() {
      var pos = loopery.mouse.pos.copy();
      if (loopery.editor.snap_to_grid) { snapToGrid(pos, loopery.editor.gridsize); }
      loopery.editor.circle_tool.params.center_pos = pos;
    },
    next_state: "choose_edge"
  },
  
  choose_edge: {
    onenter: function() {},
    
    draw: function() {
      var pos = loopery.mouse.pos.copy();
      if (loopery.editor.snap_to_grid) { snapToGrid(pos, loopery.editor.gridsize); }
      
      draw.circle(loopery.ctx,
        loopery.editor.circle_tool.params.center_pos,
        distance(pos, loopery.editor.circle_tool.params.center_pos),
        {
          fill: 'transparent',
          stroke: loopery.display.track_color,
          lineWidth: loopery.display.track_width
        });
    },
    
    onleave: function() {
      var pos = loopery.mouse.pos.copy();
      if (loopery.editor.snap_to_grid) { snapToGrid(pos, loopery.editor.gridsize); }
      loopery.editor.circle_tool.params.radius = distance(pos, loopery.editor.circle_tool.params.center_pos);
      loopery.editor.circle_tool.complete();
    },
    
    next_state: "choose_center"
  }
}
