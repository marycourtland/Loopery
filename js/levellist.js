loopery.levels = [
  'levels/test_level_3.json',
  'levels/tester.json',
  'levels/ld_level_1.json',
  'levels/ld_level_2.json',
  'levels/ld_level_3.json',
  'levels/test_level_1.json',
  'levels/triangle.json'
]

loopery.loadLevelData = function(level_url, onSuccess, onError) {
  $.ajax({
    url: level_url,
    success: function(data) {
      console.log("Loaded level from", level_url);
      if (typeof onSuccess === 'function') { onSuccess(JSON.parse(data)); }
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
  })
})