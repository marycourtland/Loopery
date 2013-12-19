game.display.menu_button_size = xy(100, 20);

// TODO: refactor this shit. Abstract button object

// Button to move to next level
var next_level = new GameObject(game);
next_level.p1 = xy(15, 500);
next_level.p2 = add(next_level.p1, game.display.menu_button_size);
next_level.draw = function() {
  this.ctx.globalAlpha = 0.3;
  rect(this.ctx, this.p1, this.p2, 'black');
  this.ctx.globalAlpha = 1;
  game.setFont(game.display.font_tiny);
  text(this.ctx, "Skip to next level", xy(65,508), "centered");
}
next_level.contains = function(pos) { return isBetweenCoords(pos, this.p1, this.p2) }
next_level.onclick = function() { console.log('next level!'); game.doNextLevel(); }


// Button to restart level
var restart_level = new GameObject(game);
restart_level.p1 = xy(15, 530);
restart_level.p2 = add(restart_level.p1, game.display.menu_button_size);
restart_level.draw = function() {
  this.ctx.globalAlpha = 0.3;
  rect(this.ctx, this.p1, this.p2, 'black');
  this.ctx.globalAlpha = 1;
  game.setFont(game.display.font_tiny);
  text(this.ctx, "Restart level", xy(65, 538), "centered");
}
restart_level.contains = function(pos) { return isBetweenCoords(pos, this.p1, this.p2) }
restart_level.onclick = function() { game.startCurrentLevel(); }

// Button to restart game
var restart_game = new GameObject(game);
restart_game.p1 = xy(15, 560);
restart_game.p2 = add(restart_game.p1, game.display.menu_button_size);
restart_game.draw = function() {
  this.ctx.globalAlpha = 0.3;
  rect(this.ctx, this.p1, this.p2, 'black');
  this.ctx.globalAlpha = 1;
  game.setFont(game.display.font_tiny);
  text(this.ctx, "Restart game", xy(65, 568), "centered");
}
restart_game.contains = function(pos) { return isBetweenCoords(pos, this.p1, this.p2) }
restart_game.onclick = function() { game.restart(); }

