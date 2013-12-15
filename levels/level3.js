var level3 = makeLevel(game, 3);
// 

var track3_start = makeCircleTrack(level3, xy(-50, 300), 40);
var track3_1 = makeCircleTrack(level3, xy(300, 270), 70);
var track3_2 = makeCircleTrack(level3, xy(400, 120), 70);
var track3_3 = makeCircleTrack(level3, xy(400, 480), 70);
var track3_4 = makeCircleTrack(level3, xy(500, 330), 70);
var track3_end = makeCircleTrack(level3, xy(850, track3_4.pos.y-30), 40);
track3_end.setEnd();

var track3_start1 = makeOuterTangentTrack(level3, track3_start, track3_1, 1, true);
var track3_12 = makeOuterTangentTrack(level3, track3_1, track3_2, 1);
var track3_13 = makeInnerTangentTrack(level3, track3_1, track3_3, 0);
var track3_24 = makeInnerTangentTrack(level3, track3_2, track3_4, 0);
var track3_34 = makeOuterTangentTrack(level3, track3_3, track3_4, 0);
var track3_4end = makeOuterTangentTrack(level3, track3_4, track3_end, 0);

track3_start.connections[track3_start1.id] = true;
track3_1.connections[track3_start1.id] = true;
track3_2.connections[track3_12.id] = true;
track3_3.connections[track3_13.id] = true;
track3_4.connections[track3_24.id] = true;
track3_4.connections[track3_34.id] = true;
track3_end.connections[track3_4end.id] = true;

level3.loadActions.push(function() {
  game.player_train.setTrack(track3_start, 0.3, -1);
  game.player_train.enable()
});

level3.leaveActions.push(function() {
  game.player_train.disable()
});

