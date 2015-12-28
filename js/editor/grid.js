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

  loopery.configLayer(this.grid_canvas[0].getContext('2d'));
  this.grid.redraw();
}

loopery.editor.destroyGridCanvas = function() {
  if (this.grid_canvas) this.grid_canvas.remove();
  this.grid_canvas = null;
}

loopery.editor.clearGrid = function() {
  draw.clear(this.grid_canvas[0].getContext('2d'));
}

loopery.editor.drawGridDot = function(pos) {
  draw.circle(this.grid_canvas[0].getContext('2d'), pos, 1, {fill: 'white'});
}

// =====================================================================================

// Different types of grids...

loopery.editor.grids = {};

loopery.editor.grids.rectangular = {
  origin: xy(0, 0),
  size: xy(20, 20),

  getSizeFromInput: function() {
    var d = parseInt($("#grid-size-input input").val());

    // No need to re-create vector objects every tick
    if (d !== this.size.x) {
      this.size._set_xy(d, d);
    }

    return this.size;
  },

  redraw: function() {
    loopery.editor.clearGrid();
    var size = this.getSizeFromInput();

    var start = xy(0, 0);
    var end = add(this.origin, scale(loopery.size, 0.5));

    var ctx = loopery.editor.grid_canvas[0].getContext('2d');
    ctx.translate(this.origin.x, this.origin.y); // make sure center of grid is in the specified origin

    // Draw each quadrant separately.
    // Reason: to make sure the center of the screen is aligned with a dot

    draw.inEachQuadrant(ctx, function() {
      pos = start.copy();
      while (pos.y < end.y) {
        while (pos.x < end.x) {
          loopery.editor.drawGridDot(pos);
          pos.xshift(size.x);
        }
        pos.x = 0;
        pos.yshift(size.y);
      }
    })

    ctx.translate(-this.origin.x, -this.origin.y);
  },

  transformPos: function(pos) {
    return snapToGrid(pos, loopery.editor.grids.rectangular.getSizeFromInput());
  }
}
 
// =====================================================================================


loopery.editor.grids.radial = {
  origin: xy(0, 0),
  size: rth(20, Math.PI/20), // optimally this should be an integer fraction of 2pi

  getSizeFromInput: function() {
    var d = parseInt($("#grid-size-input input").val());
    var angle = parseInt($("#grid-size-angle-input-radial input").val());

    // No need to re-create vector objects every tick
    if (d !== this.size.x) {
      this.size._set_rth(d, radians(angle));
    }

    return this.size;
  },

  redraw: function() {
    loopery.editor.clearGrid();
    var size = this.getSizeFromInput();

    // Draw dot at origin
    loopery.editor.drawGridDot(this.origin);

    // Now go out in circular layers...
    var max_radius = Math.min(loopery.size.x, loopery.size.y);

    for (var r = size.r; r < max_radius; r += size.r) {
      for (var th = 0; th < 2 * Math.PI; th += size.th) {
        var dot_pos = rth(r, th).add(this.origin);
        loopery.editor.drawGridDot(dot_pos);
      }
    }
  },

  transformPos: function(pos) {
    return snapToGridRadial(pos, loopery.editor.grids.radial.size, loopery.editor.grids.radial.origin);
  }
}

// =====================================================================================

loopery.editor.grids.triangular = {
  origin: xy(0, 0),
  size: rth(20, Math.PI/3), // optimally this should be an integer fraction of 2pi

  getSizeFromInput: function() {
    var d = parseInt($("#grid-size-input input").val());
    var angle = parseInt($("#grid-size-angle-input-triangle input").val());
    if (d !== this.size.x) {
      this.size._set_rth(d, radians(angle));
    }
    return this.size;
  },

  redraw: function() {
    loopery.editor.clearGrid();
    var size = this.getSizeFromInput();

    var start = xy(0, 0);
    var end = add(this.origin, scale(loopery.size, 0.5));

    var ctx = loopery.editor.grid_canvas[0].getContext('2d');
    ctx.translate(this.origin.x, this.origin.y); // make sure center of grid is in the specified origin

    // Draw each quadrant separately.
    // Reason: to make sure the center of the screen is aligned with a dot
    draw.inEachQuadrant(ctx, function() {
      var pos = start.copy();

      while (pos.y < end.y) {
        while (pos.x < end.x) {
          loopery.editor.drawGridDot(pos);
          pos.xshift(2 * size.x);
        }

        pos.x = start.x - size.x;
        pos.yshift(size.y);

        while (pos.x < end.x) {
          loopery.editor.drawGridDot(pos);
          pos.xshift(2 * size.x);
        }

        pos.x = start.x;
        pos.yshift(size.y);
      }
    })

    ctx.translate(-this.origin.x, -this.origin.y);
  },

  transformPos: function(pos) {
    return snapToGridTriangular(pos, loopery.editor.grids.triangular.size);
  }
}