loopery.levels = [
  'levels/advanceguard.json',
  'levels/ld_level_3.json',
]

loopery.loadLevelData = function(level_url, onSuccess, onError) {
  $.ajax({
    url: level_url,
    success: function(data) {
      console.log("Loaded level from", level_url);
      data = (typeof data === 'object') ? data : JSON.parse(data);
      if (typeof onSuccess === 'function') { onSuccess(data); }
    },
    error: function(response) {
      console.error("Couldn't load level from", level_url);
      if (typeof onError === 'function') { onError(response); }
    }
  })
}

// Load each level and add it to the menu
$(document).ready(function() {
  loopery.levels.forEach(function(level_url) {
    var link = loopery.levelMenu.makeLink();
    loopery.loadLevelData(level_url,
      function(level_data) {
        loopery.levelMenu.attachLevelToLink(link, level_data);
      },
      function(response) {
        link.remove();
      }
    )
  });
})


