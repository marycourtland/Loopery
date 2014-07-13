// Level 3: Another simple level where the player makes his/her first choice (other than which avatar)
var level3 = makeLevel(game, 3);

level3.showText = function() {
  game.setFont(game.display.font_normal);
  text(game.ctx, "and sometimes", xy(210, 520), "centered");
  text(game.ctx, "you've a choice to make.", xy(630, 520), "centered");
}
level3.setStart(makeCircleTrack(level3, xy(-50, 300), 40));
var track3_1 = makeCircleTrack(level3, xy(300, 270), 70);
var track3_2 = makeCircleTrack(level3, xy(400, 120), 70);
var track3_3 = makeCircleTrack(level3, xy(400, 480), 70);
var track3_4 = makeCircleTrack(level3, xy(500, 330), 70);
level3.setEnd(makeCircleTrack(level3, xy(850, track3_4.pos.y-30), 40));

var track3_start1 = makeOuterTangentTrack(level3, level3.getStart(), track3_1, 1, true);
var track3_12 = makeOuterTangentTrack(level3, track3_1, track3_2, 1);
var track3_13 = makeInnerTangentTrack(level3, track3_1, track3_3, 0);
var track3_24 = makeInnerTangentTrack(level3, track3_2, track3_4, 0);
var track3_34 = makeOuterTangentTrack(level3, track3_3, track3_4, 0);
var track3_4end = makeOuterTangentTrack(level3, track3_4, level3.getEnd(), 0);

level3.joints_toggled_on = [
  [level3.getStart(), track3_start1],
  [track3_1, track3_start1],
  [track3_2, track3_12],
  [track3_3, track3_13],
  [track3_4, track3_24],
  [track3_4, track3_34],
  [level3.getEnd(), track3_4end],
]

level3.loadActions.push(function() {
  game.player_train.setTrack(level3.getStart(), 0.3, -1);
  game.player_train.enable()
});

level3.leaveActions.push(function() {
  game.player_train.disable()
});

