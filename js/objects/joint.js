loopery.Joint = function(data, canvas_context, lookup_func) {
  this.tick = function() {}
  this.draw = function() {}

  this.id = data.id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;
  this.getData = function() {
    return {}
  }
}
