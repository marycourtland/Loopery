var level5 = makeLevel(game, 5);
// 

var track5_start = makeCircleTrack(level5, xy(-50, 300), 40);
var track5_1 = makeCircleTrack(level5, xy(400, track5_start.pos.y), 40);
var track5_end = makeCircleTrack(level5, xy(850, track5_start.pos.y), 40);
track5_end.setEnd();

var track5_start1 = makeInnerTangentTrack(level5, track5_start, track5_1, 0);
var track5_1end = makeInnerTangentTrack(level5, track5_1, track5_end, 1);

track5_start.connections[track5_start1.id] = true;
track5_1.connections[track5_start1.id] = true;
track5_1.connections[track5_1end.id] = true;
track5_end.connections[track5_1end.id] = true;

level5.loadActions.push(function() {
  game.player_train.setTrack(track5_start, 0.5,-1);
  game.player_train.enable()
});

level5.leaveActions.push(function() {
  game.player_train.disable()
});

