loopery.Decoration = function(id, canvas_context, lookup_func) {
  this.obj_type = 'decoration';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.init = function(data) {}

  this.getData = function() {
    return {}
  }
  
  this.tick = function() {}
  this.draw = function() {}
  
}
