loopery.levels = [
  {
    url: 'levels/intro.json',
    link: null,
    data: null
  },
  {
    url: 'levels/boat.json',
    link: null,
    data: null
  },
  {
    url: 'levels/shortpaths.json',
    link: null,
    data: null
  },
  {
    url: 'levels/shortpaths2.json',
    link: null,
    data: null
  },
  {
    url: 'levels/quitehard.json',
    link: null,
    data: null
  },
  {
    url: 'levels/advanceguard.json',
    link: null,
    data: null
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

loopery.fetchLevelData = function(level_index) {
  var url = loopery.levels[level_index].url;
  loopery.levels[level_index].link = loopery.levelMenu.makeLink();

  if (loopery.isLevelSolved(level_index)) {
    loopery.levels[level_index].link.addClass('level-solved');
  }

  $.ajax({
    url: url,

    success: function(data) {
      var level_data;
      try {
        level_data = (typeof data === 'object') ? data : JSON.parse(data);
      }
      catch(e) {
        console.warn('Error parsing level JSON at ' + url + ':', e);
        return;
      }
      level_data.info = level_data.info || {};
      level_data.info.index = level_index;
      loopery.levels[level_index].data = level_data;
      loopery.levelMenu.attachLevelToLink(loopery.levels[level_index].link, level_data.info.name, function() {
        loopery.startGameplay(level_index);
      });
    },

    error: function(response) {
      console.warn('Error loading level JSON at ' + url + ':', response);
      loopery.levels[level_index].link.remove();
    }
  })
}

// Load each level and add it to the menu
$(document).ready(function() {
  for (var index = 0; index < loopery.levels.length; index++) {
    loopery.fetchLevelData(index);
  }
})


