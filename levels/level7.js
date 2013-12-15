
var level_end = makeLevel(game, 99);

level_end.showText = function() {
  game.setFont(game.display.font_large);
  text(game.ctx, "Thank you for playing!", xy(400, 200), "centered");
  game.setFont(game.display.font_normal, "italic");
  text(game.ctx, "Game made for Ludum Dare 28", xy(400, 250), "centered");
}
