loopery.Joint = function(data, canvas_context, lookup_func) {
  this.id = data.id;
  this.ctx = canvas_context;
  this.lookup = lookup_func;

  this.loop = this.lookup('loops', data.loop);
  this.connector = this.lookup('connectors', data.connector);
  this.winding = data.winding;

  this.getData = function() {
    return {
      id: this.id,
      loop: this.loop.id,
      connector: this.connector.id,
      winding: this.winding
    }
  }

  this.tick = function() {}
  this.draw = function() {}

}

