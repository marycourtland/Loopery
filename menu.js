game.display.menu_button_size = xy(120, 20);
game.display.menu_pad = xy(15, 10);
game.display.menu_pos = xy(0, 0);
game.display.menu_area = xy(game.display.menu_button_size.x + 2 * game.display.menu_pad.x, game.size.y);

// Menu object (this doesn't do much - just a display)
game.menu = new GameObject(game);
game.menu.contains = function(pos) { return isInArea(pos, game.display.menu_pos, game.display.menu_area) };
game.menu.draw = function() {
  this.ctx.globalAlpha = 0.2;
  rect(this.ctx, game.display.menu_pos, add(game.display.menu_pos, game.display.menu_area), "black");
  this.ctx.globalAlpha = 1;
}

// Button object
function makeButton(pos, label, callback) {
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

// Button to enter or leave level editor
var enable_editor = makeButton(
  xy(15, 440),
  "Enter level editor",
  function() {
    if (game.editor.enabled === false) {
      game.enableEditor();
      this.label = "Leave level editor";
    }
    else {
      game.disableEditor();
      this.label = "Enter level editor";
      game.restart();
    }
  }
);


// Button to open the level loader
var load_level = makeButton(
  xy(15, 470),
  "Save or load a level",
  function() { game.showLoader(); }
);

// Button to move to next level
var next_level = makeButton(
  xy(15, 500),
  "Skip to next level",
  function() { game.endLevel(); }
);

// Button to restart level
var restart_level = makeButton(
  xy(15, 530),
  "Restart level",
  function() { game.startCurrentLevel(); }
);

// Button to restart game
var restart_level = makeButton(
  xy(15, 560),
  "Restart game",
  function() { game.restart(); }
);
