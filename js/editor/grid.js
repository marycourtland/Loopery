// *********************************************************************
// Grid
loopery.editor.gridsize = xy(20, 20);
loopery.editor.snap_to_grid = false;

loopery.editor.drawGrid = function() {
  if (!this.snap_to_grid) return;
  var pos = xy(0, 0);
  loopery.ctx.globalAlpha = 0.7;
  while (pos.y < loopery.size.y) {
    while (pos.x < loopery.size.x) {
      if (!loopery.menu.contains(pos)) draw.circle(loopery.ctx, pos, 1, 'black');
      pos.xshift(this.gridsize.x);
    }
    pos.x = 0;
    pos.yshift(this.gridsize.y);
  }
  loopery.ctx.globalAlpha = 1;
}
