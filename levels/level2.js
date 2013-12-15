// Level 2: simple two-circle level for the player to get used to navigating

var level2 = makeLevel(game, 2);

level2.showText = function() {
  game.setFont(game.display.font_normal);
  text(game.ctx, "Sometimes there is a single path to take", xy(400, 520), "centered");
}

var track2_start = makeCircleTrack(level2, xy(-50, 200), 40);
var track2_1 = makeCircleTrack(level2, xy(400, 200), 40);
var track2_2 = makeCircleTrack(level2, xy(400, 380), 40);
var track2_end = makeCircleTrack(level2, xy(850, track2_2.pos.y), 40);
track2_end.setEnd();

var track2_start1 = makeOuterTangentTrack(level2, track2_start, track2_1, 0);
var track2_12 = makeOuterTangentTrack(level2, track2_1, track2_2, 0 );
var track2_2end = makeOuterTangentTrack(level2, track2_2, track2_end, 0);

level2.joints_toggled_on = [
  [track2_start, track2_start1],
  [track2_1, track2_start1],
  [track2_2, track2_12],
  [track2_end, track2_2end],
]
level2.loadActions.push(function() {
  game.player_train.setTrack(track2_start, 0, 1);
  game.player_train.enable()
});

level2.leaveActions.push(function() {
  game.player_train.disable()
});

