// Level 5: the first sort-of-puzzlish level
var level5 = makeLevel(game, 5);

var l5_r = 100;

level5.setStart(makeCircleTrack(level5, xy(-90, 340), 80));
var track5_1 = makeCircleTrack(level5, xy(game.center.x - l5_r, 190), 70);
var track5_2 = makeCircleTrack(level5, xy(game.center.x - l5_r, 190 + 2*l5_r), 70);
var track5_3 = makeCircleTrack(level5, xy(game.center.x + l5_r, 190), 70);
var track5_4 = makeCircleTrack(level5, xy(game.center.x + l5_r, 190 + 2*l5_r), 70);
level5.setEnd(makeCircleTrack(level5, xy(850, track5_4.pos.y-30), 40));

var track5_start1 = makeInnerTangentTrack(level5, level5.getStart(), track5_1, 1);
var track5_4end = makeOuterTangentTrack(level5, track5_4, level5.getEnd(), 0);
var track5_12a = makeInnerTangentTrack(level5, track5_1, track5_2, 0);
var track5_12b = makeInnerTangentTrack(level5, track5_1, track5_2, 1);
var track5_13a = makeInnerTangentTrack(level5, track5_1, track5_3, 0);
var track5_13b = makeInnerTangentTrack(level5, track5_1, track5_3, 1);
var track5_24a = makeInnerTangentTrack(level5, track5_2, track5_4, 0);
var track5_24b = makeInnerTangentTrack(level5, track5_2, track5_4, 1);
var track5_34a = makeInnerTangentTrack(level5, track5_3, track5_4, 0);
var track5_34b = makeInnerTangentTrack(level5, track5_3, track5_4, 1);
var track5_12c = makeOuterTangentTrack(level5, track5_1, track5_2, 1);
var track5_34c = makeOuterTangentTrack(level5, track5_3, track5_4, 0);
var track5_13c = makeOuterTangentTrack(level5, track5_1, track5_3, 0);
var track5_24c = makeOuterTangentTrack(level5, track5_2, track5_4, 1);

level5.joints_toggled_on = [
  [level5.getStart(), track5_start1],
  [track5_1, track5_start1],
  [track5_4, track5_4end],
  //[level5.getEnd(), track5_4end],
]

level5.loadActions.push(function() {
  game.player_train.setTrack(level5.getStart(), 0.74, 1);
  game.player_train.enable()
});

level5.leaveActions.push(function() {
  game.player_train.disable()
});

