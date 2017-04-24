// *********************************************************************
// Tool to create EVERY connector between two selected loops
loopery.editor.complete_connector_tool = {};


// Params needed to create a tangent track
loopery.editor.complete_connector_tool.params = {
  circle1: null,
  circle2: null
}

// Creates all four possible connectors between two loops
loopery.editor.complete_connector_tool.complete = function() {
  var self = loopery.editor.complete_connector_tool;
  if (!self.params.circle1 || !self.params.circle2) return;

  // Make the track
  function makeTrack(wind1, wind2) {
    var track_data = {
      id: loopery.editor.getNextId(),
      "joint1":{
        "id": loopery.editor.getNextId(),
        "loop": self.params.circle1.id,
        "winding": wind1,
        "state": false
      },
      "joint2":{
        "id": loopery.editor.getNextId(),
        "loop": self.params.circle2.id,
        "winding": wind2,
        "state": false
      }
    };

    var connector = loopery.gameplay.loadAndInitObject('connectors', 'Connector', track_data);

    connector.on("click", function(loc) {
      loopery.editor.clicked_tracks.push(this);
    })

    // Make sure joint initial state will persist
    var setJointInitialState = function() {
      if (loopery.gameplay.paused) {
        this.initial_state = this.state;
      }
    }

    var joints = connector.joints;
    joints[0].on("click", setJointInitialState);
    joints[1].on("click", setJointInitialState);

    return connector;
  }

  makeTrack(1, 1);
  makeTrack(1, -1);
  makeTrack(-1, 1);
  makeTrack(-1, -1);

  // Reset the params
  this.params.circle1 = null;
  this.params.circle2 = null;
}

// Resets the tool (called when player chooses the tool)
loopery.editor.complete_connector_tool.start = function() {
  this.current_state = "choose_circle1";
  this.params.circle1 = null;
  this.params.circle2 = null;
}

loopery.editor.complete_connector_tool.end = function() {
  this.params.circle1 = null;
  this.params.circle2 = null;
  loopery.display.shade_hovered_circle_track = false;
  // Make sure the sample tracks are cleaned up
}

// Tool states
loopery.editor.complete_connector_tool.states = {
  choose_circle1: {
    onenter: function() {
      loopery.display.shade_hovered_circle_track = true;
    },
    
    draw: function() {},
    
    onleave: function() {
      loopery.editor.complete_connector_tool.states.choose_circle1.next_state = "choose_circle1";

      if (loopery.editor.clicked_tracks.length > 0) {
        // Set params.circle1
        loopery.editor.complete_connector_tool.params.circle1 = loopery.editor.clicked_tracks[0];
        loopery.editor.complete_connector_tool.states.choose_circle1.next_state = "choose_circle2";
      }
    },
    
    next_state: "choose_circle2"
  },
  
  choose_circle2: {
    
    onenter: function() {
    },
    
    draw: function() {
      // Shade the first circle
      loopery.editor.complete_connector_tool.params.circle1.shade();
    },
    
    onleave: function() {
      if (loopery.editor.clicked_tracks.length > 0 && loopery.editor.clicked_tracks[0] !== loopery.editor.complete_connector_tool.params.circle1) {
        // Set params.circle2
        loopery.editor.complete_connector_tool.params.circle2 = loopery.editor.clicked_tracks[0];  
        loopery.display.shade_hovered_circle_track = false;

        // Create the four tracks
        loopery.editor.complete_connector_tool.complete();
      }
      else {
        // If a circle wasn't clicked, repeat this state
        loopery.editor.complete_connector_tool.states.choose_circle2.next_state = "choose_circle2";
      }
    },
    
    next_state: "choose_circle1"
  }
}

