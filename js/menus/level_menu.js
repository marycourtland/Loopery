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



loopery.levelMenu.makeButton = function(pos, label, callback) {
  var button = new GameObject(game);
  button.pos = pos;
  button.size = game.display.menu_button_size;
  button.label = label;
  button.onclick = callback;
  button.contains = function(pos) { return isInArea(pos, this.pos, this.size); }
  button.draw = function() {
    this.ctx.globalAlpha = 0.3;
    rect(this.ctx, this.pos, add(this.pos, this.size), 'black');
    this.ctx.globalAlpha = 1;
    game.setFont(game.display.font_tiny);
    text(this.ctx, this.label, yshift(add(this.pos, scale(this.size, 0.5)), -2), "centered");
  }
  return button;
}
