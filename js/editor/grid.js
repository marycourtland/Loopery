// *********************************************************************
// Grid
loopery.editor.snap_to_grid = false;
loopery.editor.grid = null;
loopery.editor.grid_canvas = null;

loopery.editor.enableGrid = function(grid) {
  this.snap_to_grid = true;
  this.grid = grid;
  loopery.mouse.snap(this.grid.transformPos);
  this.createGridCanvas();
}

loopery.editor.disableGrid = function() {
  this.snap_to_grid = false;
  this.grid = null;
  this.destroyGridCanvas();
  loopery.mouse.snap(false);
}

loopery.editor.createGridCanvas = function() {
  if (this.grid_canvas) this.grid_canvas.remove();
  this.grid_canvas = $("#game_canvas").clone();
  this.grid_canvas.attr('id', 'grid_canvas')
    .css({
      'background-color': 'transparent',
      'pointer-events': 'none'
    })
    .insertAfter("#game_canvas");
  this.grid.draw();
}

loopery.editor.destroyGridCanvas = function() {
  if (this.grid_canvas) this.grid_canvas.remove();
  this.grid_canvas = null;
}

loopery.editor.drawGridDot = function(pos) {
  draw.circle(this.grid_canvas[0].getContext('2d'), pos, 1, {fill: 'white'});
}


// Different types of grids...

loopery.editor.grids = {};

loopery.editor.grids.rectangular = {
  size: xy(20, 20),

  draw: function() {
    var pos = xy(0, 0);
    loopery.ctx.globalAlpha = 0.7;
    while (pos.y < loopery.size.y) {
      while (pos.x < loopery.size.x) {
        loopery.editor.drawGridDot(pos);
        pos.xshift(this.size.x);
      }
      pos.x = 0;
      pos.yshift(this.size.y);
    }
    loopery.ctx.globalAlpha = 1;
  },

  transformPos: function(pos) {
    return snapToGrid(pos, loopery.editor.grids.rectangular.size);
  }
}


loopery.editor.grids.radial = {
  origin: loopery.size.copy().scale(0.5),
  size: rth(20, Math.PI/20), // optimally this should be an integer fraction of 2pi

  draw: function() {
    // Draw dot at origin
    loopery.editor.drawGridDot(this.origin);

    // Now go out in circular layers...
    var max_radius = Math.min(loopery.size.x, loopery.size.y);

    for (var r = this.size.r; r < max_radius; r += this.size.r) {
      for (var th = 0; th < 2 * Math.PI; th += this.size.th) {
        var dot_pos = rth(r, th).add(this.origin);
        loopery.editor.drawGridDot(dot_pos);
      }
    }
  },

  transformPos: function(pos) {
    return snapToGridRadial(pos, loopery.editor.grids.radial.size, loopery.editor.grids.radial.origin);
  }
}