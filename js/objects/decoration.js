// Decorations are basically arrays of draw commands

loopery.Decoration = function(id, canvas_context, lookup_func) {
  this.group = 'decorations';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;
  this.draw = null;
  Events.init(this);

  this.init = function(data) {
    this.draw = data;
  }

  this.getData = function() {
    return this.draw;
  }
  
  this.on('tick', 'tick_decoration', function() {});

  this.on('draw', 'draw_decoration', function() {
    if (!loopery.state.redraw_bg) { return; }
    if (!this.draw) { return; }
    var cmd = this.draw.command;
    var args = [this.ctx];
    if (this.draw.args) {
      this.draw.args.forEach(function(arg) { args.push(arg); }); 
    }
    params = this.draw.params || {};
    args.push(params);
    draw[cmd].apply(draw, args);
  });
  
}
