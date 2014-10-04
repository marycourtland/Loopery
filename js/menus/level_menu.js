loopery.levelMenu = new GameObject(loopery);

loopery.levelMenu.tickActions.push(function() {
})

loopery.levelMenu.drawActions.push(function() {
  // Render all the levels

})

$(document).ready(function() {
  // Put links to each level
  loopery.levelMenu.makeLevelLink(test_level);
  loopery.levelMenu.makeLevelLink(test_level_2);
})

loopery.levelMenu.makeLevelLink = function(level_data) {
  $("<a></a>")
    .text(level_data.info.name)
    .bind('click', function() { loopery.startGameplay(level_data); })
    .attr('href', '#')
    .appendTo("#level_menu");
}