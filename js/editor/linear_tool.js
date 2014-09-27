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
    draw.line(game.ctx, this.pos1, this.pos2, {
      stroke: color,
      linewidth: game.display.track_width
    })
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
