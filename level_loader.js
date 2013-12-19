//var test_level_string = "c:17=70,300,270,start,1;18=70,400,120;19=70,400,480;20=70,497,329,end,0;l:17,18,out,1,off,on;17,19,in,0,off,on;18,20,in,0,off,on;19,20,out,0,off,on;"
var test_level_string = "c:10=40,400,200,start,0;11=40,400,380,end,0;l:10,11,out,0,off,on;"

game.loader = {} // scope

game.loader.start_track_indicator = 'start';
game.loader.end_track_indicator = 'end';

// This takes a level object and returns a string representation
game.loader.saveLevel = function(level) { // The argument should be a level object
  var s = "";
  
  if (level.getStartTrack()) var start_which = level.getTrackById(Object.keys(level.getStartTrack().connections)[0]).which_outer; // start/end linear tracks are always outer tangents
  if (level.getEndTrack()) var end_which = level.getTrackById(Object.keys(level.getEndTrack().connections)[0]).which_outer;
  
  // Encode circular tracks
  s += "c:";
  for (var i in level.tracks) {
    if (level.tracks[i].type !== "circular") continue;
    if (level.tracks[i].is_start) continue; // don't encode these
    if (level.tracks[i].is_end) continue;
    
    s += level.tracks[i].id.toString() + "="
    s += level.tracks[i].radius.toString() + ","
    s += level.tracks[i].pos.x.toString() + ","
    s += level.tracks[i].pos.y.toString()
    
    if (level.tracks[i].is_first) { s += ",start," + start_which.toString() } 
    if (level.tracks[i].is_last) { s += ",end," + end_which.toString() }
    s += ";"
  }
  
  // Encode linear tracks
  s += "l:";
  for (var i in level.tracks) {
    if (level.tracks[i].type !== "linear") continue;
    if (level.tracks[i].is_start) continue; // don't encode these
    if (level.tracks[i].is_end) continue;
    if (level.tracks[i].track1.is_start) continue;
    if (level.tracks[i].track2.is_start) continue;
    if (level.tracks[i].track1.is_end) continue;
    if (level.tracks[i].track2.is_end) continue;
    
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
game.loader.loadLevel = function(level_string) {
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
    // Todo: throw an error if the parameters (radius, positionX, positionY) weren't all there
    var new_track = makeCircleTrack(level, pos, radius, id);
    
    // If this is the starting track, create a pseudotrack offscreen (of the same radius)
    // and a linear track connecting them
    // It needs to have 2 extra params (for a total of 5)
    // TODO: this could be put in a separate method
    if (params.length >= 5 && params[3] === game.loader.start_track_indicator) {
      var start_pseudotrack = makeCircleTrack(level, xy(-radius - game.display.train_radius, pos.y), radius, 'level#' + level.id + '_start');
      var which = parseInt(params[4]);
      var start_track_linear = makeOuterTangentTrack(level, start_pseudotrack, new_track, which);      
      
      // Always have the track ends toggled on
      level.joints_toggled_on.push([start_pseudotrack, start_track_linear]);
      level.joints_toggled_on.push([new_track, start_track_linear]);
      
      // Have the player train start here
      level.loadActions.push(function() {
        // TODO: it would be nice if this method referred to a track id, not that track object. SO CHANGE ALL REFERENCES TO THIS METHOD
        game.player_train.setTrack(start_track_linear, 0, 1);
        game.player_train.enable()
      });
      
      start_pseudotrack.setStart();

    }
    
    // Similarly, create an ending pseudotrack if needed
    // TODO: this can also be a separate method
    if (params.length >= 5 && params[3] === game.loader.end_track_indicator) {
      var end_pseudotrack = makeCircleTrack(level, xy(game.size.x + radius + game.display.train_radius, pos.y), radius, 'level#' + level.id + '_end');
      var which = parseInt(params[4]);
      var end_track_linear = makeOuterTangentTrack(level, new_track, end_pseudotrack, which);      
      
      // Always have the track ends toggled on
      level.joints_toggled_on.push([new_track, end_track_linear]);
      level.joints_toggled_on.push([end_pseudotrack, end_track_linear]);
      
      end_pseudotrack.setEnd();

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



