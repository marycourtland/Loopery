//var test_level_string = "c:17=70,300,270,start,1;18=70,400,120;19=70,400,480;20=70,497,329,end,0;l:17,18,out,1,off,on;17,19,in,0,off,on;18,20,in,0,off,on;19,20,out,0,off,on;"
var test_level_string = "c:10=40,400,200,start,0;11=40,400,380,end,0;l:10,11,out,0,off,on;"


game.loadCurrentLevel = function() {
}

game.loader = {} // scope

// This takes a level object and returns a json representation
game.loader.getLevelJson = function(level) { // The argument should be a level object
  return JSON.stringify(level.data());
}

// This takes a json representation of a level and creates & returns a level object
game.loader.loadLevelFromJson = function(level_string) {
  var new_level = makeLevel(game, game.levels.length);
  var level_data = JSON.parse(level_string);

  // Load tracks first: circular, then linear
  level_data.t.c.forEach(function(track_data) {
    loadCircleTrackFromData(new_level, track_data);
  })

  level_data.t.l.forEach(function(track_data) {
    loadLinearTrackFromData(new_level, track_data);
  })

  new_level.setStart(new_level.tracks[level_data.s]);
  new_level.setEnd(new_level.tracks[level_data.e]);
  new_level.setStartDir(level_data.sd);

  level_data.j.forEach(function(joint_ids) {
    new_level.joints_toggled_on.push([
      new_level.tracks[joint_ids[0]],
      new_level.tracks[joint_ids[1]]
    ])
  })

  // Switch to the new level
  game.orderObjects();
  game.goToLevel(new_level.id);
  
  return new_level;
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
  document.getElementById("level_output").textContent = this.loader.getLevelJson(this.levels[this.current_level]);
}

game.loadInputLevel = function() {
  // TODO: doublecheck if the player wants to clear/leave the current level
  this.loader.loadLevelFromJson(document.getElementById("level_input").value);
  this.exitLoader();
}
