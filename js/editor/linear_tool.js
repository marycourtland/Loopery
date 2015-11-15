// *********************************************************************
// Tool to create linear tracks
loopery.editor.linear_tool = {};


// Params needed to create a tangent track
loopery.editor.linear_tool.params = {
  circle1: null,
  circle2: null
}

// Creates a linear track (tangent to two circles) based on the input params
loopery.editor.linear_tool.complete = function(sample_track) {
  if (!sample_track) { return; }

  // Make the track
  var track_data = {
    id: loopery.editor.getNextId(),
    "joint1":{
      "id": loopery.editor.getNextId(),
      "loop": sample_track.circle1.id,
      "winding": sample_track.wind1,
      "state":false
    },
    "joint2":{
      "id": loopery.editor.getNextId(),
      "loop": sample_track.circle2.id,
      "winding": sample_track.wind2,
      "state":false
    }
  };

  var connector = loopery.gameplay.loadAndInitObject('connectors', 'Connector', track_data);

  connector.on("click", function(loc) {
    loopery.editor.clicked_tracks.push(this);
  })

  // Reset the params
  this.params.circle1 = null;
  this.params.circle2 = null;
  this.params.wind1 = null;
  this.params.wind2 = null;
}

// Objects that function simply as sample tracks for the designer to choose from
// (once the designer has chosen two circular tracks).
// Four of these will be made
loopery.editor.linear_tool.makeSampleTrack = function(wind1, wind2) {
  var track = new GameObject(loopery);
  track.type = "linear"; // for ordering purposes
  
  var circle1 = loopery.editor.linear_tool.params.circle1;
  var circle2 = loopery.editor.linear_tool.params.circle2;


  var tangentData = loopery.getTangent(circle1, circle2, wind1, wind2);

  track.pos1 = tangentData.origin; // Convert from track position to XY coord position
  track.pos2 = add(tangentData.origin, tangentData.vector);
  
  // NB: assume none of the calculated points were NaNs
  
  track.circle1 = circle1;
  track.circle2 = circle2;

  track.wind1 = wind1;
  track.wind2 = wind2;
  
  track.contains = function(pos) { return isOnLineSegment(pos, this.pos1, this.pos2, loopery.display.track_width); }
  track.draw = function() {
    // Draw the line
    var color = 'white';
    if (!this.contains(loopery.mouse.pos)) {
      loopery.ctx.globalAlpha = 0.3;
      color = 'white';
    }
    draw.line(loopery.ctx, this.pos1, this.pos2, {
      stroke: color,
      lineWidth: loopery.display.track_width
    })
    loopery.ctx.globalAlpha = 1;
  };
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
  console.log('STARTING CONNECTOR')
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
  this.sample_tracks = [];
  this.do_sample_tracks_exist = false;
}

// Tool states
loopery.editor.linear_tool.states = {
  choose_circle1: {
    onenter: function() {
      console.log('CONNECTOR ONENTER')
      loopery.display.shade_hovered_circle_track = true;
    },
    
    draw: function() {},
    
    onleave: function() {
      loopery.editor.linear_tool.states.choose_circle1.next_state = "choose_circle1";

      if (loopery.editor.clicked_tracks.length > 0) {
        // Set params.circle1
        loopery.editor.linear_tool.params.circle1 = loopery.editor.clicked_tracks[0];
        loopery.editor.linear_tool.states.choose_circle1.next_state = "choose_circle2";
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
        loopery.editor.linear_tool.sample_tracks.push(loopery.editor.linear_tool.makeSampleTrack(1, 1));
        loopery.editor.linear_tool.sample_tracks.push(loopery.editor.linear_tool.makeSampleTrack(1, -1));
        loopery.editor.linear_tool.sample_tracks.push(loopery.editor.linear_tool.makeSampleTrack(-1, -1));
        loopery.editor.linear_tool.sample_tracks.push(loopery.editor.linear_tool.makeSampleTrack(-1, 1));
        loopery.editor.linear_tool.do_sample_tracks_exist = true;
      }
      
    },
    
    draw: function() {
      // Shade the first two circles
      loopery.editor.linear_tool.params.circle1.shade();
      loopery.editor.linear_tool.params.circle2.shade();
      loopery.editor.linear_tool.sample_tracks.forEach(function(track) {
        track.draw();
      })
    },
    
    onleave: function() {
        loopery.editor.linear_tool.states.choose_type.next_state = "choose_type";

        // Find which sample track the designer clicked
        loopery.editor.linear_tool.sample_tracks.forEach(function(track) {

          if (track.contains(loopery.mouse.pos)) {

            // Create the track
            loopery.editor.linear_tool.complete(track);

            loopery.editor.linear_tool.destroy_sample_tracks();
        
            loopery.editor.linear_tool.states.choose_type.next_state = "choose_circle1";
          }
        });
      
    },
    
    next_state: "choose_circle1"
  }
}
