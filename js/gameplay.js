loopery.gameplay = {

  // Objects unique to each level (rendered in this order)
  // every group maps an id to the object.

  // levelObjects: {
  //   connectors: {},
  //   loops: {},
  //   orbs: {},
  //   decorations: {},
  //   joints: {}
  // },

  levelObjects: {},

  init: function() {
    var _this = this;
    loopery.objectTypes.forEach(function(obj) {
      _this.levelObjects[obj.group] = {};
    })
  },

  tick: function() { this.applyToObjectGroups('tick') },
  draw: function() { this.applyToObjectGroups('draw') },

  applyToObjectGroups: function(func_name) {
    for (var object_group in this.levelObjects) {
      for (var id in this.levelObjects[object_group]) {
        this.levelObjects[object_group][id][func_name]()
      }
    }
  },

  getLookupMethod: function() {
    // This method will be given to child objects so that they
    // can reference other objects by id
    var _this = this;
    return function(id, object_group) {
      // allow the function to be called with the object group/type (optional)
      // to improve performance
      if (object_group in _this.levelObjects) {
        return _this.levelObjects[object_group][id] || null;
      }

      for (var object_group in _this.levelObjects) {
        if (id in _this.levelObjects[object_group]) {
          return _this.levelObjects[object_group][id];
        }
      }
      return null;
    }
  },

  loadLevel: function(level_data) {
    var lookup = this.getLookupMethod();
    var _this = this;

    // Create objects
    loopery.objectTypes.forEach(function(obj) {
      level_data[obj.group].forEach(function(object_data) {
        var id = object_data["id"];
        var ObjectType = loopery[obj.type];
        _this.levelObjects[obj.group][id] = new ObjectType(id, loopery.ctx, lookup);
      })
    })

    // Initialize them
    // *** Since the different object types refer to each other (during initializing), this
    // needs to be totally separate from the object creation
    loopery.objectTypes.forEach(function(obj) {
      level_data[obj.group].forEach(function(object_data) {
        var id = object_data["id"];
        _this.levelObjects[obj.group][id].init(object_data);
      })
    })

  }
}
