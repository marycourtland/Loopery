// ========= LEVELS
// 

// Call this to enable game levels 
function enableLevels(game) {
  game.levels = [];
  game.current_level = 0;
  game.tickActions.push(function() { this.levels[this.current_level].tick(); });
  game.finalActions.push(function() { this.levels[this.current_level].draw(); });
  game.doNextLevel = function() {
    this.levels[this.current_level].onleave();
    this.current_level += 1; 
    
    if (this.current_level === this.levels.length) {
      game.restart();
    }
    else {
      game.startCurrentLevel();
    }
  }
  
  game.goToLevel = function(id) {
    if (id >= this.levels.length || id < 0) return;
    this.levels[this.current_level].onleave();
    this.current_level = id;
    game.startCurrentLevel();
  }
}

// Call this to create a level
function makeLevel(game, id) {
  var lvl = {
    id: id,
    
    // Fill in level data members here (e.g. level text, level solution, etc)
    
    tracks: {},
    
    showText: function() {}, // overwrite
    
    joints_toggled_on: [],
    
    draw: function() {
      // Fill this in (code for drawing level text, background, and other non-objects)
      //game.setFont(game.display.font_normal);
      //text(game.ctx, "Level " + this.id.toString(), xy(30, 20), "nw");
      this.showText();
      
    },
    onrun: function() {
      for (var i = 0; i < this.runActions.length; i++) {
        this.runActions[i].call(this);
      }
    },
    onload: function() {
      
      game.setAllJoints(false);
      for (var i = 0; i < this.joints_toggled_on.length; i++) {
        this.joints_toggled_on[i][0].connections[this.joints_toggled_on[i][1].id] = true;
      }
      
      for (var i = 0; i < this.loadActions.length; i++) {
        this.loadActions[i].call(this);
      }
    },
    onleave: function() {
      for (var i = 0; i < this.leaveActions.length; i++) {
        this.leaveActions[i].call(this);
      }
    },
    tick: function() {
      for (var i = 0; i < this.tickActions.length; i++) {
        this.tickActions[i].call(this);
      }
    },
    runActions: [],
    loadActions: [],
    leaveActions: [],
    tickActions: [],
  };
  game.levels.push(lvl);
  
  lvl.loadActions.push(function() { 
    // Code to perform when the level is loaded
  });
  
  lvl.leaveActions.push(function() {
    // Code to perform when the level is left
    
  });
  
  // Other methods
  lvl.getTrackById = function(id) {
    if (id in this.tracks) return this.tracks[id];
    return null;
  }
  
  lvl.getStartTrack = function() {
    // There should be only one start track, so loop through till we find it
    for (var id in this.tracks) {
      if (this.tracks[id].is_start) return this.tracks[id];
    }
    return null;
  }
  
  lvl.getEndTrack = function() {
    // There should be only one end track, so loop through till we find it
    for (var id in this.tracks) {
      if (this.tracks[id].is_end) return this.tracks[id];
    }
    return null;
  }
  
  lvl.getFirstTrack = function() {
    // There should be only one first track, so loop through till we find it
    for (var id in this.tracks) {
      if (this.tracks[id].is_first) return this.tracks[id];
    }
    return null;
  }
  
  lvl.getLastTrack = function() {
    // There should be only one last track, so loop through till we find it
    for (var id in this.tracks) {
      if (this.tracks[id].is_last) return this.tracks[id];
    }
    return null;
  }
  
  return lvl;
}

// Call this to create an object which exists only in the scope of a single level
function makeLevelObject(parent_level) {
  var obj = new GameObject(game);
  obj.level = parent_level;
  obj._tick = obj.tick;
  obj._draw = obj.draw;
  obj.tick = function() { if (game.levels[game.current_level].id != this.level.id) return; this._tick(); }
  obj.draw = function() { if (game.levels[game.current_level].id != this.level.id) return; this._draw(); }
  return obj;
}


