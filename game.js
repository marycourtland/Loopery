// The game
var game = new Game({bg_color:'#0a492c'});
game.setTitle("Loops of Fate");
game.setSize(xy(800, 600));
game.center = xy(400, 300);
enableLevels(game);

window.onload = function() {
  game.orderObjects();
  game.start();
}

game.orderObjects = function() {
  game.bringToFront('circular');
  game.bringToFront('train');
  game.bringToFront('clicker');
  game.bringToFront('resizer');
}

game.bringToFront = function(type) {
  // loop backwards so we don't skip items
  for (var i = this.objects.length - 1; i >= 0; i--) {
    if (!this.objects[i].type || this.objects[i].type !== type) continue;
    this.objects.push(this.objects.splice(i, 1)[0]);
  }
}

game.setAllJoints = function(setting) {
  for (var i = 0; i < this.tracks.length; i++) {
    if (this.tracks[i].type !== 'circular') continue;
    for (var linear_track in this.tracks[i].connections) {
      this.tracks[i].connections[linear_track] = setting;
    }
  }
}

game.next_track = 0;
game.tracks = {};

game.clicked_tracks = [];
game.tickActions.push(function() { this.clicked_tracks = []; });

// Player-driven train possibilities
game.train1 = makeTrain('#111f3e', null);
game.train2 = makeTrain('#5d1f3e', null);
game.train3 = makeTrain('#5da63e', null);

game.train1.is_player = true;
game.train2.is_player = true;
game.train3.is_player = true;

// Reference to the player's chosen train
game.player_train = null;
game.player_has_chosen_train = false;

game.choosePlayerTrain = function(train) {
  if (this.player_has_chosen_train) return; // only choose the first one that gets chosen
  this.player_train = train;
  this.player_has_chosen_train = true;
}
game.resetPlayerTrain = function(train) { // Call this when resetting the game
  this.player_train = null;
  this.player_has_chosen_train = false;
}

game.hide_trains = false;

// ========== GAME STAGES
game.titlescreen = function() {
  clear(this.ctx);
  this.setFont(this.display.font_title);
  text(this.ctx, this.title, xy(400, 150), "centered");
  this.setFont(this.display.font_large, "italic");
  text(this.ctx, "Click to continue", xy(400, 250), "centered");
  this.next();
  //setTimeout(function() { game.exitTitlescreen(); }, 1*1000);
}
game.gameplay = function() {
  clear(this.ctx);
  if (this.isKeyPressed("L")) {}
  iter(this.objects, function(obj) { obj.tick(); });
  iter(this.objects, function(obj) { obj.draw(); });
  this.next();
}

// Stage-switching methods
game.exitTitlescreen = function() {
  this.doNextLevel();
  this.stage = game.gameplay;
}
game.ctx.canvas.addEventListener("click", function(event) {
  if (game.stage === game.titlescreen) { game.exitTitlescreen(); }
})
game.restart = function() {
  this.current_level = 0;
  game.stage = game.titlescreen;
}
game.startCurrentLevel = function() {
  this.levels[this.current_level].onload();
}

game.toggleElement = function(element_id) {
  var v = document.getElementById(element_id).style.visibility;
  if (v === 'hidden') document.getElementById(element_id).style.visibility = '';
  else document.getElementById(element_id).style.visibility = 'hidden';
}
game.hideElement = function(element_id) {
  document.getElementById(element_id).style.visibility = 'hidden';
}
game.showElement = function(element_id) {
  document.getElementById(element_id).style.visibility = '';
}


game.hideElement("game_fadeout"); // start with the fadeout layer hidden (i.e. game is not faded out)
game.hideElement("level_loader");

// Initial stage
game.stage = game.titlescreen;
