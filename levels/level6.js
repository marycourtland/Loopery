// Level 6: triangles!
var level6 = makeLevel(game, 6);

var l6_r = 100;
var l6_d = 30;
var l6_first_pos = xy(225, 300);

var track6_start = makeCircleTrack(level6, xy(-50, l6_first_pos.y), l6_d);
var track6_end = makeCircleTrack(level6, xy(850, l6_first_pos.y), l6_d);
track6_end.setEnd();


var track6_1 = makeCircleTrack(level6, add(l6_first_pos, rth(3*l6_r, -Math.PI/3)), l6_d);
var track6_2 = makeCircleTrack(level6, add(l6_first_pos, rth(2*l6_r, -Math.PI/3)), l6_d);
var track6_3 = makeCircleTrack(level6, xshift(add(l6_first_pos, rth(2*l6_r, -Math.PI/3)), l6_r), l6_d);
var track6_4 = makeCircleTrack(level6, add(l6_first_pos, rth(l6_r, -Math.PI/3)), l6_d);
var track6_5 = makeCircleTrack(level6, xshift(add(l6_first_pos, rth(l6_r, -Math.PI/3)), l6_r), l6_d);
var track6_6 = makeCircleTrack(level6, xshift(add(l6_first_pos, rth(l6_r, -Math.PI/3)), 2*l6_r), l6_d);
var track6_7 = makeCircleTrack(level6, l6_first_pos, l6_d);
var track6_8 = makeCircleTrack(level6, xshift(l6_first_pos, l6_r), l6_d);
var track6_9 = makeCircleTrack(level6, xshift(l6_first_pos, 2*l6_r), l6_d);
var track6_10 = makeCircleTrack(level6, xshift(l6_first_pos, 3*l6_r), l6_d);
var track6_11 = makeCircleTrack(level6, add(l6_first_pos, rth(l6_r, Math.PI/3)), l6_d);
var track6_12 = makeCircleTrack(level6, xshift(add(l6_first_pos, rth(l6_r, Math.PI/3)), l6_r), l6_d);
var track6_13 = makeCircleTrack(level6, xshift(add(l6_first_pos, rth(l6_r, Math.PI/3)), 2*l6_r), l6_d);
var track6_14 = makeCircleTrack(level6, add(l6_first_pos, rth(2*l6_r, Math.PI/3)), l6_d);
var track6_15 = makeCircleTrack(level6, xshift(add(l6_first_pos, rth(2*l6_r, Math.PI/3)), l6_r), l6_d);
var track6_16 = makeCircleTrack(level6, add(l6_first_pos, rth(3*l6_r, Math.PI/3)), l6_d);

var track6_start7 = makeOuterTangentTrack(level6, track6_start, track6_7, 1);
var track6_10end = makeOuterTangentTrack(level6, track6_10, track6_end, 1);

makeInnerTangentTrack(level6, track6_7, track6_4, 0);
makeOuterTangentTrack(level6, track6_7, track6_4, 0);
makeOuterTangentTrack(level6, track6_11, track6_8, 0);
makeInnerTangentTrack(level6, track6_8, track6_5, 1);
makeOuterTangentTrack(level6, track6_8, track6_9, 1);
makeInnerTangentTrack(level6, track6_4, track6_8, 1);
makeOuterTangentTrack(level6, track6_12, track6_9, 0);
makeInnerTangentTrack(level6, track6_5, track6_9, 0);
makeInnerTangentTrack(level6, track6_13, track6_9, 1);
makeOuterTangentTrack(level6, track6_6, track6_10, 1);
makeInnerTangentTrack(level6, track6_4, track6_8, 1);
makeInnerTangentTrack(level6, track6_2, track6_5, 0);
makeOuterTangentTrack(level6, track6_6, track6_13, 0);
makeInnerTangentTrack(level6, track6_6, track6_3, 0);
makeOuterTangentTrack(level6, track6_2, track6_1, 0);
makeInnerTangentTrack(level6, track6_2, track6_3, 0);
makeInnerTangentTrack(level6, track6_1, track6_3, 1);
makeOuterTangentTrack(level6, track6_7, track6_11, 0);
makeOuterTangentTrack(level6, track6_11, track6_12, 0);
makeOuterTangentTrack(level6, track6_11, track6_14, 1);
makeInnerTangentTrack(level6, track6_12, track6_14, 1);
makeInnerTangentTrack(level6, track6_12, track6_15, 0);
makeOuterTangentTrack(level6, track6_14, track6_15, 1);
makeOuterTangentTrack(level6, track6_14, track6_16, 1);
makeInnerTangentTrack(level6, track6_14, track6_16, 0);



level6.joints_toggled_on = [
  [track6_start, track6_start7],
  [track6_7, track6_start7],
  [track6_10, track6_10end],
  [track6_end, track6_10end],
]

level6.loadActions.push(function() {
  game.player_train.setTrack(track6_start, 0.5, -1);
  game.player_train.enable()
});

level6.leaveActions.push(function() {
  game.player_train.disable()
});


