loopery.levelMenu = new GameObject(loopery);

loopery.levelMenu.tickActions.push(function() {
})

loopery.levelMenu.drawActions.push(function() {
  // Render all the levels

})

loopery.levelMenu.makeLink = function() {
  return $("<a></a>").addClass('level-menu-link').appendTo("#level_menu");
}


loopery.levelMenu.attachLevelToLink = function(link, label, callback) {
  link.text(label).bind('click', callback);
}
