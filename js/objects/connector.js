loopery.Connector = function(data, canvas_context, lookup_func) {

  this.id = data.id;

  // set loop endpoints
  this.loops = []
  this.loops[data.loop1] = {
    pos: data.pos1,
    wind: data.wind1
  }
  this.loops[data.loop2] = {
    pos: data.pos2,
    wind: data.wind2
  }

  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.getData = function() {
    return {}
  }

  this.tick = function() {}
  this.draw = function() {}


}
