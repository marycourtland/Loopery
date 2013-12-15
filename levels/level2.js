var level2 = makeLevel(game, 2);

var track2_start = makeCircleTrack(level2, xy(-50, 200), 40);
var track2_1 = makeCircleTrack(level2, xy(400, 200), 40);
var track2_2 = makeCircleTrack(level2, xy(400, 380), 40);
var track2_end = makeCircleTrack(level2, xy(850, track2_2.pos.y), 40);
track2_end.setEnd();

var track2_start1 = makeOuterTangentTrack(level2, track2_start, track2_1, 0);
var track2_12 = makeOuterTangentTrack(level2, track2_1, track2_2, 0 );
var track2_2end = makeOuterTangentTrack(level2, track2_2, track2_end, 0);

track2_start.connections[track2_start1.id] = true;
track2_1.connections[track2_start1.id] = true;
track2_2.connections[track2_12.id] = true;
track2_end.connections[track2_2end.id] = true;

level2.loadActions.push(function() {
  game.player_train.setTrack(track2_start, 0, 1);
  game.player_train.enable()
});

level2.leaveActions.push(function() {
  game.player_train.disable()
});

