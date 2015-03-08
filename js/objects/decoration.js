loopery.Decoration = function(id, canvas_context, lookup_func) {
  this.group = 'decorations';
  this.id = id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.init = function(data) {}

  this.getData = function() {
    return {}
  }
  
  $(this).on('tick', function() {});
  $(this).on('draw', function() {});
  
}
