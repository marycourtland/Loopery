loopery.levels = [
  {
    url: 'levels/intro.json',
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


loopery.loadNextLevel = function() {
  loopery.startGameplay(loopery.gameplay.current_level + 1);
}

loopery.loadPreviousLevel = function() {
  loopery.startGameplay(loopery.gameplay.current_level - 1);
}

loopery.fetchLevelData = function(level_index) {
  var url = loopery.levels[level_index].url;
  loopery.levels[level_index].link = loopery.levelMenu.makeLink();

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


