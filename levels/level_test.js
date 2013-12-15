var level2 = makeLevel(game, -1);

var track2_1 = makeCircleTrack(level2, xy(200, 290), 100);
var track2_2 = makeCircleTrack(level2, xy(500, 290), 60);
var track2_3 = makeCircleTrack(level2, xy(460, 70), 30);
var track2_4 = makeCircleTrack(level2, xy(660, 150), 50);

var track2_12 = makeInnerTangentTrack(level2, track2_1, track2_2, 0);
var track2_23 = makeOuterTangentTrack(level2, track2_2, track2_3, 1);
var track2_34 = makeOuterTangentTrack(level2, track2_3, track2_4, 1);

track2_2.connections[track2_23.id] = true;
track2_3.connections[track2_23.id] = true;
track2_3.connections[track2_34.id] = true;
track2_4.connections[track2_34.id] = true;


level2.loadActions.push(function() {
  game.train1.setTrack(track2_1, 0, 1);
  game.train2.setTrack(track2_1, 0.33, 1);
  game.train3.setTrack(track2_1, 0.66, 1);
  
  game.train1.enable()
  game.train2.enable()
  game.train3.enable()
});

level2.leaveActions.push(function() {
  game.train1.disable()
  game.train2.disable()
  game.train3.disable()
});
