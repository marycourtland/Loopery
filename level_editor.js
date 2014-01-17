// When you enter the level editor:
// - a new, empty level is created and game.custom_level is set to it
// - it's added to game.custom_levels
// - game.editor is enabled (via game.enableEditor())
// - game.editor is a GameObject, but all of its methods should return if the editor isn't enabled
//   (i.e. game.editor.enabled is true)

// Tools:
// - Tool to create new circular track (lets you click twice to position the center and edge)
// - Tool to create new linear track (lets you click two circles to position the track)
// - Select/edit tool (lets you drag circles around and change their size and drag linear tracks around)
// - Delete tool (guess what this does!)


// TODOS:
// - A "clear all" function/button
// - Select/edit tool
//    - Let designer resize circles
// - Delete tool
// - Display something that indicates which tool is the current tool
// - Display informative text showing how to use the tool
// - Let the designer choose the gridsize
// - Let the designer try out the game
// - Let the designer choose starting and ending tracks

game.editor = new GameObject(game);

game.editor.enabled = false;
game.enableEditor = function() {
  if (game.editor.enabled) {
    game.editor.setTool(game.editor.current_tool);
  }
  else {
    game.editor.enabled = true;
    game.editor.setTool(game.editor.circle_tool);
  }
  game.editor.custom_level = makeLevel(game, game.levels.length);
  game.current_level = game.editor.custom_level.id;
  game.hide_trains = true;
}

game.disableEditor = function() {
  if (this.editor.current_tool) this.editor.current_tool.end();
  this.editor.enabled = false;
  game.hide_trains = false;
}

game.editor.setTool = function(tool) {
  if (this.current_tool) this.current_tool.end();
  this.current_tool = tool;
  this.current_tool.start();
  this.current_tool.states[this.current_tool.current_state].onenter();
}

game.editor.draw = function() {
  if (!this.enabled) return;
  this.drawGrid();
  this.current_tool.states[this.current_tool.current_state].draw();
  this.current_tool.button.highlight();
  
  // Menu labels
  text(this.ctx, "LEVEL EDITOR", xy(15, 20), "nw");
  text(this.ctx, "Tools", xy(15, 170), "nw");
}

game.editor.tick = function() {
}

// Clicks will make a tool transition to the next state.
game.onclick(function() {
  if (!game.editor.enabled) return;
  if (game.menu.contains(mouse.pos)) return;
  tool = game.editor.current_tool;
  tool.states[tool.current_state].onleave();
  tool.current_state = tool.states[tool.current_state].next_state;
  tool.states[tool.current_state].onenter();
});

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
      circle(game.ctx, pos, game.display.track_width/2, game.display.track_color);
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


// *********************************************************************
// Tool to create linear tracks
game.editor.linear_tool = {};

// Params needed to create a tangent track
game.editor.linear_tool.params = {
  circle1: null,
  circle2: null,
  type: null,
  which: null
}

// Creates a linear track (tangent to two circles) based on the input params
game.editor.linear_tool.complete = function() {
  if (this.params.circle1 === null
      || this.params.circle2 === null
      || this.params.type === null
      || this.params.which === null) return;
  
  var makeTrackFunc = (this.params.type === "outer") ? makeOuterTangentTrack : makeInnerTangentTrack; 
  
  // Make the track
  var track = makeTrackFunc(game.editor.custom_level, this.params.circle1, this.params.circle2, this.params.which);
  
  // Reset the params
  this.params.circle1 = null;
  this.params.circle2 = null;
  this.params.type = null;
  this.params.which = null;
}

// Objects that function simply as sample tracks for the designer to choose from
// (once the designer has chosen two circular tracks).
// Four of these will be made, corresponding to these four combinations:
//   type = "outer", which = 0
//   type = "outer", which = 1
//   type = "inner", which = 0
//   type = "inner", which = 1
// They are created during the "choose_type_and_which" state.
game.editor.linear_tool.makeSampleTrack = function(type, which) {
  var track = new GameObject(game);
  track.type = "linear"; // for ordering purposes
  
  var circle1 = game.editor.linear_tool.params.circle1;
  var circle2 = game.editor.linear_tool.params.circle2;
  
  // Calculate track endpoints
  var pts = (type === "outer") ?
        getOuterTangents(circle1, circle2)[which]
      : getInnerTangents(circle1, circle2)[which];
  
  pts[0] = circle1.getPosCoords(pts[0]); // Convert from track position to XY coord position
  pts[1] = circle2.getPosCoords(pts[1]);
  
  // NB: assume none of the calculated points were NaNs
  
  track.pos1 = pts[0];
  track.pos2 = pts[1];
  
  track.type = type;
  track.which = which;
  
  track.contains = function(pos) { return isOnLineSegment(pos, this.pos1, this.pos2, game.display.track_width); }
  track.drawActions.push(function() {
    // Draw the line
    var color = 'white';
    if (!this.contains(game.mouse.pos)) {
      game.ctx.globalAlpha = 0.3;
      color = 'black';
    }
    line(game.ctx,
      this.pos1,
      this.pos2,
      color,
      game.display.track_width
    )
    game.ctx.globalAlpha = 1;
  });
  track.onclick = function(pos) {
    // The purpose of this is to enable the level editor to know which track
    // has been selected.
    // Splice is used instead of push because we want the most recently
    // clicked track (i.e. the one later in game.objects) to be at position 0.
    game.clicked_tracks.splice(0, 0, this);
  }
  return track;
}

game.editor.linear_tool.sample_tracks = [];

game.editor.linear_tool.do_sample_tracks_exist = false;

// Resets the tool (called when player chooses the tool)
game.editor.linear_tool.start = function() {
  this.current_state = "choose_circle1";
  this.params.circle1 = null;
  this.params.circle2 = null;
  this.params.type = null;
  this.params.which = null;
}

game.editor.linear_tool.end = function() {
  this.params.circle1 = null;
  this.params.circle2 = null;
  this.params.type = null;
  this.params.which = null;
  game.display.shade_hovered_circle_track = false;
  // Make sure the sample tracks are cleaned up
  game.editor.linear_tool.destroy_sample_tracks();
}

game.editor.linear_tool.destroy_sample_tracks = function() {
  for (var i = 0; i < this.sample_tracks.length; i++) {
    this.sample_tracks[i].destroy();
  }
  this.do_sample_tracks_exist = false;
}

// Tool states
game.editor.linear_tool.states = {
  choose_circle1: {
    onenter: function() {
      game.display.shade_hovered_circle_track = true;
    },
    
    draw: function() {},
    
    onleave: function() {
      if (game.clicked_tracks.length > 0) {
        // Set params.circle1
        game.editor.linear_tool.params.circle1 = game.clicked_tracks[0];
        game.editor.linear_tool.states.choose_circle1.next_state = "choose_circle2";
      }
      else {
        // Repeat this state if a circle track hasn't been clicked
        game.editor.linear_tool.states.choose_circle1.next_state = "choose_circle1";
      }
    },
    
    next_state: "choose_circle2"
  },
  
  choose_circle2: {
    
    onenter: function() {
    },
    
    draw: function() {
      // Shade the first circle
      game.editor.linear_tool.params.circle1.shade();
    },
    
    onleave: function() {
      if (game.clicked_tracks.length > 0 && game.clicked_tracks[0] !== game.editor.linear_tool.params.circle1) {
        // Set params.circle2
        // Ensure that params.circle1 has the larger radius (because of the bug in the tangent calculations)
        if (game.clicked_tracks[0].radius > game.editor.linear_tool.params.circle1.radius) {
          game.editor.linear_tool.params.circle2 = game.editor.linear_tool.params.circle1;
          game.editor.linear_tool.params.circle1 = game.clicked_tracks[0];
        }
        else {
          game.editor.linear_tool.params.circle2 = game.clicked_tracks[0];
        }
        game.editor.linear_tool.states.choose_circle2.next_state = "choose_type_and_which";
        game.display.shade_hovered_circle_track = false;
      }
      else {
        // If a circle wasn't clicked, repeat this state
        game.editor.linear_tool.states.choose_circle2.next_state = "choose_circle2";
      }
    },
    
    next_state: "choose_type_and_which"
  },
  
  choose_type_and_which: {
    
    onenter: function() {
      // Create four "sample" tracks 
      if (!game.editor.linear_tool.do_sample_tracks_exist) {
        game.editor.linear_tool.sample_tracks.push(game.editor.linear_tool.makeSampleTrack("outer", 0));
        game.editor.linear_tool.sample_tracks.push(game.editor.linear_tool.makeSampleTrack("outer", 1));
        game.editor.linear_tool.sample_tracks.push(game.editor.linear_tool.makeSampleTrack("inner", 0));
        game.editor.linear_tool.sample_tracks.push(game.editor.linear_tool.makeSampleTrack("inner", 1));
        game.editor.linear_tool.do_sample_tracks_exist = true;
        game.orderObjects();
      }
      
    },
    
    draw: function() {
      // Shade the first two circles
      game.editor.linear_tool.params.circle1.shade();
      game.editor.linear_tool.params.circle2.shade();
    },
    
    onleave: function() {
      if (game.clicked_tracks.length > 0 ) {
        // Find which sample track the designer clicked
        game.editor.linear_tool.params.type = game.clicked_tracks[0].type;
        game.editor.linear_tool.params.which = game.clicked_tracks[0].which;
        
        // Create the track
        game.editor.linear_tool.complete();
        game.orderObjects();
        
        // Destroy the sample tracks
        game.editor.linear_tool.destroy_sample_tracks();
        
        game.editor.linear_tool.states.choose_type_and_which.next_state = "choose_circle1";
      }
      else {
        // If no linear track was clicked, repeat this state
        game.editor.linear_tool.states.choose_type_and_which.next_state = "choose_type_and_which";
      }
      
    },
    
    next_state: "choose_circle1"
      
  }
}

// *********************************************************************
// Grid
game.editor.gridsize = xy(20, 20);
game.editor.snap_to_grid = false;

game.editor.drawGrid = function() {
  if (!this.snap_to_grid) return;
  var pos = xy(0, 0);
  game.ctx.globalAlpha = 0.7;
  while (pos.y < game.size.y) {
    while (pos.x < game.size.x) {
      if (!game.menu.contains(pos)) circle(game.ctx, pos, 1, 'black');
      pos.xshift(this.gridsize.x);
    }
    pos.x = 0;
    pos.yshift(this.gridsize.y);
  }
  game.ctx.globalAlpha = 1;
}


// *********************************************************************
// Menu buttons


function makeEditorButton(pos, label, callback) {
  var button = makeButton(pos, label, callback);
  button._tick = button.tick;
  button.tick = function() {
    if (!game.editor.enabled) { return; }
    this._tick();
  }
  button._draw = button.draw;
  button.draw = function() {
    if (!game.editor.enabled) { return; }
    this._draw();
  }
  button.highlight = function() {
    emptyRect(this.ctx, this.pos, add(this.pos, this.size), 'white');
  }
  return button;
}

game.editor.test_button = makeEditorButton(
  xy(15, 40),
  "Test level (NYI)",
  function() { } // TODO: Level editor's "test level" method
);


game.editor.toggle_grid_button = makeEditorButton(
  xy(15, 70),
  "Toggle grid on",
  function() {
    if (game.editor.snap_to_grid) {
      game.editor.snap_to_grid = false;
      game.editor.toggle_grid_button.label = "Toggle grid on";
    }
    else {
      game.editor.snap_to_grid = true;
      game.editor.toggle_grid_button.label = "Toggle grid off";
    }
  }
);

game.editor.clear_all_button = makeEditorButton(
  xy(15, 100),
  "Clear all tracks (NYI)",
  function() {  } // TODO: level editor's "clear all" method
);

game.editor.choose_startend_circles = makeEditorButton(
  xy(15, 130),
  "Choose start/end (NYI)",
  function() { } // TODO: function to choose start and end points in level editor
);

game.editor.circle_tool.button = makeEditorButton(
  xy(15, 190),
  "Circular tracks",
  function() { game.editor.setTool(game.editor.circle_tool); }
);

game.editor.linear_tool.button = makeEditorButton(
  xy(15, 220),
  "Linear tracks",
  function() { game.editor.setTool(game.editor.linear_tool); }
);

game.editor.select_tool.button = makeEditorButton(
  xy(15, 250),
  "Select",
  function() { game.editor.setTool(game.editor.select_tool); }
);
  
