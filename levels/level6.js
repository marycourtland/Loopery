var level6 = makeLevel(game, 6);
// 

var l6_r = 100;

var track6_start = makeCircleTrack(level6, xy(-90, 340), 80);
var track6_1 = makeCircleTrack(level6, xy(game.center.x - l6_r, 190), 70);
var track6_2 = makeCircleTrack(level6, xy(game.center.x - l6_r, 190 + 2*l6_r), 70);
var track6_3 = makeCircleTrack(level6, xy(game.center.x + l6_r, 190), 70);
var track6_4 = makeCircleTrack(level6, xy(game.center.x + l6_r, 190 + 2*l6_r), 70);
var track6_end = makeCircleTrack(level6, xy(850, track6_4.pos.y-30), 40);
track6_end.setEnd();

var track6_start1 = makeInnerTangentTrack(level6, track6_start, track6_1, 1);
var track6_4end = makeOuterTangentTrack(level6, track6_4, track6_end, 0);
var track6_12a = makeInnerTangentTrack(level6, track6_1, track6_2, 0);
var track6_12b = makeInnerTangentTrack(level6, track6_1, track6_2, 1);
var track6_13a = makeInnerTangentTrack(level6, track6_1, track6_3, 0);
var track6_13b = makeInnerTangentTrack(level6, track6_1, track6_3, 1);
var track6_24a = makeInnerTangentTrack(level6, track6_2, track6_4, 0);
var track6_24b = makeInnerTangentTrack(level6, track6_2, track6_4, 1);
var track6_34a = makeInnerTangentTrack(level6, track6_3, track6_4, 0);
var track6_34b = makeInnerTangentTrack(level6, track6_3, track6_4, 1);


track6_start.connections[track6_start1.id] = true;
track6_1.connections[track6_start1.id] = true;
track6_4.connections[track6_4end.id] = true;
track6_end.connections[track6_4end.id] = true;

level6.loadActions.push(function() {
  game.player_train.setTrack(track6_start, 0.74, 1);
  game.player_train.enable()
});

level6.leaveActions.push(function() {
  game.player_train.disable()
});

