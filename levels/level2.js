var level2 = makeLevel(game, 2);

var track1 = makeCircleTrack(level2, xy(200, 290), 70);
var track2 = makeCircleTrack(level2, xy(400, 260), 100);
var track3 = makeCircleTrack(level2, xy(460, 70), 30);
var track4 = makeCircleTrack(level2, xy(660, 150), 50);

var track12 = makeOuterTangentTrack(level2, track1, track2, 1);
var track23 = makeOuterTangentTrack(level2, track2, track3, 1);
var track34 = makeOuterTangentTrack(level2, track3, track4, 1);

track2.connections[track23.id] = true;
track3.connections[track23.id] = true;
track3.connections[track34.id] = true;
track4.connections[track34.id] = true;


level2.loadActions.push(function() {
  game.train1.setTrack(track1, 0, -1);
  game.train2.setTrack(track1, 0.33, -1);
  game.train3.setTrack(track1, 0.66, -1);
  
  game.train1.enable()
  game.train2.enable()
  game.train3.enable()
});

level2.leaveActions.push(function() {
  // Move trains to next level
  game.train1.disable()
  game.train2.disable()
  game.train3.disable()
});
