loopery.gameplay = {

  tick: function() { this.applyToObjectGroups('tick') },
  draw: function() { this.applyToObjectGroups('draw') },

  applyToObjectGroups: function(func_name) {
    var func = function(obj) { obj[func_name](); }
    for (var object_group in this.level_objects) {
      this.level_objects[object_group].forEach(func);
    }
  },

  // Objects unique to a level (rendered in this order)
  level_objects: {
    connectors: [],
    loops: [],
    orbs: [],
    decorations: [],
    joints: []
  },

  loadLevel: function(level_data) {
    for (var )
  }
}