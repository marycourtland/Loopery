// TESTS

var test_track1 = makeCircleTrack(level1, xy(200, 290), 70);
var test_track2 = makeCircleTrack(level1, xy(400, 260), 100);
var test_track3 = makeCircleTrack(level2, xy(460, 70), 30);
var test_track4 = makeCircleTrack(level2, xy(660, 150), 50);
var test_track12 = makeLinearTrack(level1, test_track2, 0.25, 1, test_track1, 0.25, -1);
var test_track23 = makeLinearTrack(level1, test_track2, 0.94, -1, test_track3, 0.45, -1);
var test_track34 = makeLinearTrack(test_track3, 0.8, 1, test_track4, 0.8, -1);

test_track2.connections[level1, test_track23.id] = true;
test_track3.connections[level1, test_track23.id] = true;
test_track3.connections[test_track34.id] = true;
test_track4.connections[test_track34.id] = true;

var test_train1 = makeTrain('darkred', test_track1);
var test_train2 = makeTrain('darkblue', test_track2);
test_train1.dir = -1;

// Computed tangent track
var t1 = test_track3;
var t2 = test_track4;
var pts = getOuterTangents(t1, t2)
var test_track34 = makeLinearTrack(level2, t1, pts[0][0], 1, t2, pts[0][1], -1);

game.ontick(function() {
  text(game.ctx, "Try clicking here ^", xy(200, 375), 'ne', 'white')
  text(game.ctx, "^ and/or here", xy(405, 375), 'nw', 'white')
})
