//var test_level_string = "c:17=70,300,270,start,1;18=70,400,120;19=70,400,480;20=70,497,329,end,0;l:17,18,out,1,off,on;17,19,in,0,off,on;18,20,in,0,off,on;19,20,out,0,off,on;"
var test_level_string = "c:10=40,400,200,start,0;11=40,400,380,end,0;l:10,11,out,0,off,on;"


game.loadCurrentLevel = function() {
}

game.loader = {} // scope

// This takes a level object and returns a string representation
game.loader.getLevelString = function(level) { // The argument should be a level object
  var s = "";
  
  // // Determine the which for the start and end linear tracks
  // if (level.getStart()) {
  //   var start_which = level.getTrackById(Object.keys(level.getStart().connections)[0]).which_outer; // start/end linear tracks are always outer tangents
  //   console.log("start_which:", start_which)
  // }
  // if (level.getEnd()) {
  //   var end_which = level.getTrackById(Object.keys(level.getEnd().connections)[0]).which_outer;
  //   console.log("end_which:", start_which)
  // }
  
  // Encode circular tracks
  s += "c:";
  for (var i in level.tracks) {
    if (level.tracks[i].type !== "circular") continue;
    
    s += level.tracks[i].id.toString() + "="
    s += round(level.tracks[i].radius, 1).toString() + ","
    s += round(level.tracks[i].pos.x, 1).toString() + ","
    s += round(level.tracks[i].pos.y, 1).toString()
    
    if (level.tracks[i].is_start) { s += ",start," + level.getStartDir().toString() } 
    if (level.tracks[i].is_end) { s += ",end"}
    s += ";"
  }
  
  // Encode linear tracks
  s += "l:";
  for (var i in level.tracks) {
    if (level.tracks[i].type !== "linear") continue;
    
    // Tracks
    s += level.tracks[i].track1.id + ","
    s += level.tracks[i].track2.id + ","
    
    // Subtype (outer tangent or inner tangent)
    s += level.tracks[i].subtype + "," // todo: throw error if subtype is not 'out' or 'in'
    
    // 'Which' (specifies which side the tangent is on)
    // todo: throw error if which doesn't exist
    if (level.tracks[i].subtype === 'in') s += level.tracks[i].which_inner.toString() + "," 
    if (level.tracks[i].subtype === 'out') s += level.tracks[i].which_outer.toString() + "," 
    
    // Track end toggle settings (on or off)
    if (level.tracks[i].track1.connections[level.tracks[i].id]) s += "on,"
    else s += "off,"
    if (level.tracks[i].track2.connections[level.tracks[i].id]) s += "on"
    else s += "off"
    
    s += ";"
  }
  return s;
}


// This takes a string representation of a level and creates & returns a level object
game.loader.loadLevelFromString = function(level_string) {
  console.debug("Level string:");
  console.debug(level_string);
  var new_level = makeLevel(game, game.levels.length);
  var level_items = level_string.split(/:|;/)
  
  var current_parser = null;
  var item_mode = null;
  level_items.forEach(function(item) {
    if (item in game.loader.track_parsers) {
      current_parser = game.loader.track_parsers[item];
      return;
    }
    if (current_parser === null) throw "Can't load this level string because it doesn't have a mode delimiter: <" + level_string + ">";
    current_parser(item, new_level)
  });
  game.orderObjects();
  
  // Switch to new level
  game.goToLevel(new_level.id);
  
  return new_level;
}

// These methods take:
// (1) a string representing a track
// (2) a game level object
// and create the specified track in the given level
game.loader.track_parsers = {
  'c': function(item_string, level) { // Parse the string that encodes a linear track (and make the track)
    if (item_string.trim() === "") return;
    params = item_string.split(/=/);
    var id = params[0];
    params = params[1].split(",");
    var radius = parseInt(params[0]);
    var pos = xy(parseInt(params[1]),parseInt(params[2]));

    console.log(id, "PARAMS:", params.length, params)

    // Todo: throw an error if the parameters (radius, positionX, positionY) weren't all there
    var new_track = makeCircleTrack(level, pos, radius, id);
    
    // If this is the starting track, create a pseudotrack offscreen (of the same radius)
    // and a linear track connecting them
    // It needs to have 2 extra params (for a total of 5). Last two are the 'start' indicator and the start_dir.
    // TODO: this could be put in a separate method
    if (params.length >= 5 && params[3] === 'start') {
      // var start_pseudotrack = makeCircleTrack(level, xy(-radius - game.display.train_radius, pos.y), radius, 'level#' + level.id + '_start');
      level.setStartDir(parseInt(params[4]));
      // var start_track_linear = makeOuterTangentTrack(level, start_pseudotrack, new_track, which);      
      
      level.setStart(new_track);

      // Always have the track ends toggled on
      // level.joints_toggled_on.push([start_pseudotrack, start_track_linear]);
      // level.joints_toggled_on.push([new_track, start_track_linear]);
      
      // Have the player train start here
      level.loadActions.push(function() {
        // TODO: it would be nice if this method referred to a track id, not that track object. SO CHANGE ALL REFERENCES TO THIS METHOD
        game.player_train.setTrack(new_track, 0, level.getStartDir());
        game.player_train.enable()
      });
      
      // start_pseudotrack.setStart();

    }
    
    // Similarly, create an ending pseudotrack if needed
    // TODO: this can also be a separate method
    if (params.length >= 4 && params[3] === 'end') {
      // var end_pseudotrack = makeCircleTrack(level, xy(game.size.x + radius + game.display.train_radius, pos.y), radius, 'level#' + level.id + '_end');
      // var which = parseInt(params[4]);
      // var end_track_linear = makeOuterTangentTrack(level, new_track, end_pseudotrack, which);      
      
      new_track.setEnd();

      // Always have the track ends toggled on
      // level.joints_toggled_on.push([new_track, end_track_linear]);
      // level.joints_toggled_on.push([end_pseudotrack, end_track_linear]);
      
      // end_pseudotrack.setEnd();

    }
    
  },
  
  'l': function(item_string, level) { // Parse the string that encodes a circular track (and make the track)
    if (item_string.trim() === "") return;
    params = item_string.split(",");
    var track1 = level.getTrackById(params[0]);
    var track2 = level.getTrackById(params[1]);
    var which = parseInt(params[3]);
    var end1toggled = parseInt(params[4] === 'on');
    var end2toggled = parseInt(params[5] === 'on');
    
    if (track1 === null) throw "First track is null in <" + item_string + ">";
    if (track2 === null) throw "Second track is null in <" + item_string + ">";
    
    // Temporary fix for the bug in getInnerTangents (larger radius circle must be given first)
    // (just reverse track1 and track2 and their stuff)
    if (track1.radius < track2.radius) {
      var temp = track1;
      track1 = track2;
      track2 = temp;
      which = (which === 0? 1 : 0);
      end1toggled = params[5];
      end2toggled = params[4];
    }
    
    if (which !== 0 && which !== 1) {
      // Todo: throw error if the 'which' param isn't 0 or 1
    }
    
    if (params[2] === 'in') {
      var new_track = makeInnerTangentTrack(level, track1, track2, which);
    }
    else if (params[2] === 'out') {
      var new_track = makeOuterTangentTrack(level, track1, track2, which);
    }
    else { throw "Couldn't create the track encoded by <" + item_string + ">; third param should be 'out' or 'in'"; }
    
    if (end1toggled) { level.joints_toggled_on.push([track1, new_track]); }
    if (end2toggled) { level.joints_toggled_on.push([track2, new_track]); }
    
  }
}


game.exitLoader = function() {
  // TODO: if game pausing is implemented, unpause the game
  this.hideElement("game_fadeout"); 
  this.hideElement("level_loader");
}

game.showLoader = function() {
  // TODO: if game pausing is implemented, pause the game
  this.showElement("game_fadeout"); 
  this.showElement("level_loader");
  document.getElementById("level_output").textContent = this.loader.getLevelString(this.levels[this.current_level]);
}

game.loadInputLevel = function() {
  // TODO: doublecheck if the player wants to clear/leave the current level
  this.loader.loadLevelFromString(document.getElementById("level_input").value);
  this.exitLoader();
}
