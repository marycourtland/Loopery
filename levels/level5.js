// Level 5: the first sort-of-puzzlish level
var level5 = makeLevel(game, 5);

var l6_r = 100;

var track5_start = makeCircleTrack(level5, xy(-90, 340), 80);
var track5_1 = makeCircleTrack(level5, xy(game.center.x - l6_r, 190), 70);
var track5_2 = makeCircleTrack(level5, xy(game.center.x - l6_r, 190 + 2*l6_r), 70);
var track5_3 = makeCircleTrack(level5, xy(game.center.x + l6_r, 190), 70);
var track5_4 = makeCircleTrack(level5, xy(game.center.x + l6_r, 190 + 2*l6_r), 70);
var track5_end = makeCircleTrack(level5, xy(850, track5_4.pos.y-30), 40);
track5_end.setEnd();

var track5_start1 = makeInnerTangentTrack(level5, track5_start, track5_1, 1);
var track5_4end = makeOuterTangentTrack(level5, track5_4, track5_end, 0);
var track5_12a = makeInnerTangentTrack(level5, track5_1, track5_2, 0);
var track5_12b = makeInnerTangentTrack(level5, track5_1, track5_2, 1);
var track5_13a = makeInnerTangentTrack(level5, track5_1, track5_3, 0);
var track5_13b = makeInnerTangentTrack(level5, track5_1, track5_3, 1);
var track5_24a = makeInnerTangentTrack(level5, track5_2, track5_4, 0);
var track5_24b = makeInnerTangentTrack(level5, track5_2, track5_4, 1);
var track5_34a = makeInnerTangentTrack(level5, track5_3, track5_4, 0);
var track5_34b = makeInnerTangentTrack(level5, track5_3, track5_4, 1);

level5.joints_toggled_on = [
  [track5_start, track5_start1],
  [track5_1, track5_start1],
  [track5_4, track5_4end],
  [track5_end, track5_4end],
]

level5.loadActions.push(function() {
  game.player_train.setTrack(track5_start, 0.74, 1);
  game.player_train.enable()
});

level5.leaveActions.push(function() {
  game.player_train.disable()
});

