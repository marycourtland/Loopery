// *********************************************************************
// Grid
game.editor.gridsize = xy(20, 20);
game.editor.snap_to_grid = false;

game.editor.drawGrid = function() {
  if (!this.snap_to_grid) return;
  var pos = xy(0, 0);
  game.ctx.globalAlpha = 0.7;
  while (pos.y < game.size.y) {
    while (pos.x < game.size.x) {
      if (!game.menu.contains(pos)) draw.circle(game.ctx, pos, 1, 'black');
      pos.xshift(this.gridsize.x);
    }
    pos.x = 0;
    pos.yshift(this.gridsize.y);
  }
  game.ctx.globalAlpha = 1;
}
