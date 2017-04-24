loopery.levels = [
  {
    url: 'levels/intro.json',
    section: 'INTRO'
  },
  {
    url: 'levels/intro2.json',
    section: 'INTRO'
  },
  {
    url: 'levels/advanceguard.json',
    section: 'INTRO'
  },
  {
    url: 'levels/outofthewayadvanceguard.json',
    section: 'INTRO'
  },
  {
    url: 'levels/square1.json',
    section: 'EASY'
  },
  {
    url: 'levels/hexagon1.json',
    section: 'EASY'
  },
  {
    url: 'levels/hexagon4.json',
    section: 'EASY'
  },
  {
    url: 'levels/longboat.json',
    section: 'EASY'
  },
  {
    url: 'levels/shortpaths2.json',
    section: 'A BIT HARDER'
  },
  {
    url: 'levels/shortpaths.json',
    section: 'A BIT HARDER'
  },
  {
    url: 'levels/brg3.json',
    section: 'A BIT HARDER'
  },
  {
    url: 'levels/bhsl2.json',
    section: 'A BIT HARDER'
  },
  {
    url: 'levels/bhsl1.json',
    section: 'MOST DIFFICULT'
  },
  {
    url: 'levels/plus.json',
    section: 'MOST DIFFICULT'
  },
  {
    url: 'levels/bhsl3.json',
    section: 'MOST DIFFICULT'
  },
  {
    url: 'levels/quitehard.json',
    section: 'MOST DIFFICULT'
  }
]

loopery.isLevelSolved = function(level_index) {
  if (!(level_index in loopery.levels)) { return false; }
  var url = loopery.levels[level_index].url;

  var solved_levels = loopery.localStorageGet('solved_levels') || {};

  if (!(url in solved_levels)) { return false; }
  return solved_levels[url];
}

loopery.markLevelSolved = function(level_index) {
  if (!(level_index in loopery.levels)) { return false; }
  var url = loopery.levels[level_index].url;

  loopery.levels[level_index].link.addClass('level-solved');

  var solved_levels = loopery.localStorageGet('solved_levels') || {};
  solved_levels[url] = true;

  loopery.localStorageSet('solved_levels', solved_levels);
}

loopery.loadNextLevel = function() {
  loopery.startGameplay(loopery.gameplay.current_level + 1);
}

loopery.loadPreviousLevel = function() {
  loopery.startGameplay(loopery.gameplay.current_level - 1);
}

loopery.isFirstLevel = function() {
  return loopery.gameplay.current_level === 0;
}

loopery.isLastLevel = function() {
  return loopery.gameplay.current_level === loopery.levels.length - 1;
}

loopery.setupLevelData = function(level_data) {
  var level_index = level_data.index;
  var level_metadata = loopery.levels[level_index];
  loopery.levelMenu.populateLink(level_metadata);

  if (loopery.isLevelSolved(level_index)) {
    loopery.levels[level_index].link.addClass('level-solved');
  }

  level_data.info = level_data.info || {};
  level_data.info.index = level_index;
  loopery.levels[level_index].data = level_data;
  loopery.levelMenu.attachLevelToLink(loopery.levels[level_index].link, level_data.info.name, function() {
    loopery.startGameplay(level_index);
  });
}


loopery.fetchLevelData = function(level_index, callback) {
  callback = (typeof callback === 'function') ? callback : function() {};
  var url = loopery.levels[level_index].url;

  $.ajax({
    url: url,

    success: function(data) {
      var level_data;
      try {
        level_data = (typeof data === 'object') ? data : JSON.parse(data);
      } catch(e) {
        console.warn('Error parsing level JSON at ' + url + ':', e);
        return;
      }
      level_data.index = level_index;
      callback(level_data);
    },

    error: function(response) {
      console.warn('Error loading level JSON at ' + url + ':', response);
      callback(null);
    }
  })
}

// load levels
loopery.initLevels = function() {
  if (loopery.features.asyncLevels) {
    loopery.levels.forEach(function(metadata, i) {
      loopery.fetchLevelData(i, function(level_data) {
        if (level_data) loopery.setupLevelData(level_data);
      })
    })
  }
  else {
    // Levels should be available in `levelData`
    // TODO: this is very messy and needs improvement
    loopery.levels = window.levelData;

    levelData.forEach(function(level, i) {
      level.data.index = i;
      loopery.setupLevelData(level.data);
    })
  }
}
