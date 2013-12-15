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
      this.current_level = 0;
      game.stage = game.titlescreen;
    }
    else {
      this.levels[this.current_level].onload();
    }
  }
}

// Call this to create a level
function makeLevel(game, id) {
  var lvl = {
    id: id,
    
    // Fill in level data members here (e.g. level text, level solution, etc)
    
    showText: function() {}, // overwrite
    
    draw: function() {
      // Fill this in (code for drawing level text, background, and other non-objects)
      this.showText();
      
    },
    onrun: function() {
      for (var i = 0; i < this.runActions.length; i++) {
        this.runActions[i].call(this);
      }
    },
    onload: function() {
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


