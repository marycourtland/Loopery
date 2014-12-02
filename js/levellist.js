loopery.levels = [
  'levels/ld_level_1.json',
  'levels/ld_level_2.json',
  'levels/ld_level_3.json',
  'levels/test_level_2.json'
]


// Load each level and add it to the menu
$(document).ready(function() {
  loopery.levels.forEach(function(level_url) {
    var link = loopery.levelMenu.makeLink();
    $.ajax({
      url: level_url,
      
      success: function(data) {
        console.log("Loaded level from", level_url);
        level_data = JSON.parse(data);
        loopery.levelMenu.attachLevelToLink(link, level_data);
      },

      error: function(response) {
        console.error("Couldn't load level from", level_url);
        link.remove();
      }
    })
  })
})