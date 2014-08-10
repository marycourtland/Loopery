// The game
var loopery = new Game();
loopery.setTitle("Loopery");
loopery.setSize(xy(800, 600));
loopery.center = xy(400, 300);

window.onload = function() {
  loopery.orderObjects();
  loopery.start();
}

loopery.orderObjects = function() {
  loopery.bringToFront('connector');
  loopery.bringToFront('loop');
  loopery.bringToFront('orb');
  loopery.bringToFront('joint');
  loopery.bringToFront('resizer');
}

loopery.bringToFront = function(type) {
  // loop backwards so we don't skip items
  for (var i = this.objects.length - 1; i >= 0; i--) {
    if (!this.objects[i].type || this.objects[i].type !== type) continue;
    this.objects.push(this.objects.splice(i, 1)[0]);
  }
}

// TODO: hopefully do a better way of detecting clicked tracks
// (necessary for level editor)
loopery.clicked_tracks = [];
loopery.tickActions.push(function() { this.clicked_tracks = []; });


loopery.disable_gameplay = false;

// ========== GAME STAGES
loopery.stages.titlescreen = function() {
  clear(this.ctx);
  this.setFont(this.display.font_title);
  text(this.ctx, this.title, xy(400, 150), "centered");
  this.setFont(this.display.font_large, "italic");
  text(this.ctx, "Click to continue", xy(400, 250), "centered");
  this.next();
  //setTimeout(function() { loopery.exitTitlescreen(); }, 1*1000);
}

loopery.stages.levelmenu = function() {
  clear(this.ctx);
  this.levelMenu.tick();
  this.levelMenu.draw();
  this.next();
}

loopery.stages.gameplay = function() {
  clear(this.ctx);
  this.gameplay.tick();
  this.gameplay.draw();
  this.next();
}

// Stage-switching methods
loopery.exitTitlescreen = function() {
  this.doNextLevel();
  this.currentStage = loopery.gameplay;
}
loopery.ctx.canvas.addEventListener("click", function(event) {
  if (loopery.currentStage === loopery.titlescreen) { loopery.exitTitlescreen(); }
})
loopery.restart = function() {
  this.current_level = 0;
  loopery.currentStage = loopery.titlescreen;
}
loopery.startCurrentLevel = function() {
  this.levels[this.current_level].onload();
}

loopery.toggleElement = function(element_id) {
  var v = document.getElementById(element_id).style.visibility;
  if (v === 'hidden') document.getElementById(element_id).style.visibility = '';
  else document.getElementById(element_id).style.visibility = 'hidden';
}
loopery.hideElement = function(element_id) {
  document.getElementById(element_id).style.visibility = 'hidden';
}
loopery.showElement = function(element_id) {
  document.getElementById(element_id).style.visibility = '';
}


loopery.hideElement("game_fadeout"); // start with the fadeout layer hidden (i.e. game is not faded out)
loopery.hideElement("level_loader");

// Initial stage
loopery.currentStage = loopery.titlescreen;
