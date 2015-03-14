// *********************************************************************
// Tool to create linear tracks
loopery.editor.linear_tool = {};

// Params needed to create a tangent track
loopery.editor.linear_tool.params = {
  circle1: null,
  circle2: null,
  // type: null,
  // which: null
}

// Creates a linear track (tangent to two circles) based on the input params
loopery.editor.linear_tool.complete = function() {
  if (this.params.circle1 === null
      || this.params.circle2 === null
      || this.params.type === null
      || this.params.which === null) return;
  
  var makeTrackFunc = (this.params.type === "outer") ? makeOuterTangentTrack : makeInnerTangentTrack; 
  
  // Make the track
  var track = makeTrackFunc(loopery.editor.custom_level, this.params.circle1, this.params.circle2, this.params.which);
  
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
// They are created during the "choose_type" state.
loopery.editor.linear_tool.makeSampleTrack = function(type, which) {
  var track = new GameObject(loopery);
  track.type = "linear"; // for ordering purposes
  
  var circle1 = loopery.editor.linear_tool.params.circle1;
  var circle2 = loopery.editor.linear_tool.params.circle2;
  
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
  
  track.contains = function(pos) { return isOnLineSegment(pos, this.pos1, this.pos2, loopery.display.track_width); }
  track.drawActions.push(function() {
    // Draw the line
    var color = 'white';
    if (!this.contains(loopery.mouse.pos)) {
      loopery.ctx.globalAlpha = 0.3;
      color = 'black';
    }
    draw.line(loopery.ctx, this.pos1, this.pos2, {
      stroke: color,
      linewidth: loopery.display.track_width
    })
    loopery.ctx.globalAlpha = 1;
  });
  track.onclick = function(pos) {
    // The purpose of this is to enable the level editor to know which track
    // has been selected.
    // Splice is used instead of push because we want the most recently
    // clicked track (i.e. the one later in loopery.objects) to be at position 0.
    loopery.editor.clicked_tracks.splice(0, 0, this);
  }
  return track;
}

loopery.editor.linear_tool.sample_tracks = [];

loopery.editor.linear_tool.do_sample_tracks_exist = false;

// Resets the tool (called when player chooses the tool)
loopery.editor.linear_tool.start = function() {
  this.current_state = "choose_circle1";
  this.params.circle1 = null;
  this.params.circle2 = null;
  // this.params.type = null;
  // this.params.which = null;
}

loopery.editor.linear_tool.end = function() {
  this.params.circle1 = null;
  this.params.circle2 = null;
  this.params.type = null;
  this.params.which = null;
  loopery.display.shade_hovered_circle_track = false;
  // Make sure the sample tracks are cleaned up
  loopery.editor.linear_tool.destroy_sample_tracks();
}

loopery.editor.linear_tool.destroy_sample_tracks = function() {
  for (var i = 0; i < this.sample_tracks.length; i++) {
    this.sample_tracks[i].destroy();
  }
  this.do_sample_tracks_exist = false;
}

// Tool states
loopery.editor.linear_tool.states = {
  choose_circle1: {
    onenter: function() {
      loopery.display.shade_hovered_circle_track = true;
    },
    
    draw: function() {},
    
    onleave: function() {
      if (loopery.editor.clicked_tracks.length > 0) {
        // Set params.circle1
        console.debug('Setting params.circle1');
        loopery.editor.linear_tool.params.circle1 = loopery.editor.clicked_tracks[0];
        loopery.editor.linear_tool.states.choose_circle1.next_state = "choose_circle2";
      }
      else {
        // Repeat this state if a circle track hasn't been clicked
        loopery.editor.linear_tool.states.choose_circle1.next_state = "choose_circle1";
      }
    },
    
    next_state: "choose_circle2"
  },
  
  choose_circle2: {
    
    onenter: function() {
    },
    
    draw: function() {
      // Shade the first circle
      loopery.editor.linear_tool.params.circle1.shade();
    },
    
    onleave: function() {
      if (loopery.editor.clicked_tracks.length > 0 && loopery.editor.clicked_tracks[0] !== loopery.editor.linear_tool.params.circle1) {
        // Set params.circle2
        console.debug('Setting params.circle2');
        loopery.editor.linear_tool.params.circle2 = loopery.editor.clicked_tracks[0];  
        loopery.editor.linear_tool.states.choose_circle2.next_state = "choose_type";
        loopery.display.shade_hovered_circle_track = false;
      }
      else {
        // If a circle wasn't clicked, repeat this state
        loopery.editor.linear_tool.states.choose_circle2.next_state = "choose_circle2";
      }
    },
    
    next_state: "choose_type"
  },
  
  choose_type: {
    
    onenter: function() {
      // Create four "sample" tracks 
      if (!loopery.editor.linear_tool.do_sample_tracks_exist) {
        loopery.editor.linear_tool.sample_tracks.push(loopery.editor.linear_tool.makeSampleTrack("outer", 0));
        loopery.editor.linear_tool.sample_tracks.push(loopery.editor.linear_tool.makeSampleTrack("outer", 1));
        loopery.editor.linear_tool.sample_tracks.push(loopery.editor.linear_tool.makeSampleTrack("inner", 0));
        loopery.editor.linear_tool.sample_tracks.push(loopery.editor.linear_tool.makeSampleTrack("inner", 1));
        loopery.editor.linear_tool.do_sample_tracks_exist = true;
        loopery.orderObjects();
      }
      
    },
    
    draw: function() {
      // Shade the first two circles
      loopery.editor.linear_tool.params.circle1.shade();
      loopery.editor.linear_tool.params.circle2.shade();
    },
    
    onleave: function() {
      if (loopery.editor.clicked_tracks.length > 0 ) {
        // Find which sample track the designer clicked
        loopery.editor.linear_tool.params.type = loopery.editor.clicked_tracks[0].type;
        loopery.editor.linear_tool.params.which = loopery.editor.clicked_tracks[0].which;
        
        // Create the track
        loopery.editor.linear_tool.complete();
        loopery.orderObjects();
        
        // Destroy the sample tracks
        loopery.editor.linear_tool.destroy_sample_tracks();
        
        loopery.editor.linear_tool.states.choose_type.next_state = "choose_circle1";
      }
      else {
        // If no linear track was clicked, repeat this state
        loopery.editor.linear_tool.states.choose_type.next_state = "choose_type";
      }
      
    },
    
    next_state: "choose_circle1"
      
  }
}
