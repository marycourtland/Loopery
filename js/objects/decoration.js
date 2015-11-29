// Decorations are basically arrays of draw commands

loopery.Decoration = function(id, canvas_context, lookup_func) {
  this.group = 'decorations';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;
  this.draw = null;

  this.init = function(data) {
    this.draw = data;
  }

  this.getData = function() {
    return this.draw;
  }
  
  $(this).on('tick', function() {});

  $(this).on('draw', function() {
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
