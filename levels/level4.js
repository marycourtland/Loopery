// Level 4: A straight line (the player gets a break)
var level4 = makeLevel(game, 4);

level4.showText = function() {
  game.setFont(game.display.font_normal);
  text(game.ctx, "But when your path is done", xy(400, 480), "centered");
  text(game.ctx, "you've only taken one.", xy(400, 520), "centered");
}
level4.setStart(makeCircleTrack(level4, xy(-50, 300), 40));
level4.setEnd(makeCircleTrack(level4, xy(850, level4.getStart().pos.y), 40));

var track4_startend = makeOuterTangentTrack(level4, level4.getStart(), level4.getEnd(), 0);


level4.joints_toggled_on = [
  [level4.getStart(), track4_startend],
  [level4.getEnd(), track4_startend],
]

level4.loadActions.push(function() {
  game.player_train.setTrack(level4.getStart(), 0, 1);
  game.player_train.enable()
});

level4.leaveActions.push(function() {
  game.player_train.disable()
});

