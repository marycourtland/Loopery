// Level 4: A straight line (the player gets a break)
var level4 = makeLevel(game, 4);

var track4_start = makeCircleTrack(level4, xy(-50, 300), 40);
var track4_end = makeCircleTrack(level4, xy(850, track4_start.pos.y), 40);
track4_end.setEnd();

var track4_startend = makeOuterTangentTrack(level4, track4_start, track4_end, 0);


level4.joints_toggled_on = [
  [track4_start, track4_startend],
  [track4_end, track4_startend],
]

level4.loadActions.push(function() {
  game.player_train.setTrack(track4_start, 0, 1);
  game.player_train.enable()
});

level4.leaveActions.push(function() {
  game.player_train.disable()
});

