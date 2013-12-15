var level1 = makeLevel(game, 1);


level1.showText = function() {
  game.setFont(game.display.font_normal);
  text(game.ctx, "Choose your person!", xy(400, 200), "centered");
}

var first_track1 = makeCircleTrack(level1, xy(200, 400), 60);
var first_track2 = makeCircleTrack(level1, xy(400, 400), 60);
var first_track3 = makeCircleTrack(level1, xy(600, 400), 60);

// todo: move this train junk out of this level file
game.train1 = makeTrain('red', first_track1);
game.train2 = makeTrain('blue', first_track2);
game.train3 = makeTrain('yellow', first_track3);


level1.loadActions.push(function() {
  // Move trains to next level
  game.train1.enable()
  game.train2.enable()
  game.train3.enable()
});

level1.leaveActions.push(function() {
  // Move trains to next level
  game.train1.disable()
  game.train2.disable()
  game.train3.disable()
});
