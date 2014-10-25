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

  clear: function() {
    var _this = this;
    loopery.objectTypes.forEach(function(obj) {
      _this.levelObjects[obj.group] = {};
    })
  },

  loadLevel: function(level_data) {
    var lookup = this.getLookupMethod();
    var _this = this;

    this.clear();

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

        loopery.objects.push(_this.levelObjects[obj.group][id]);
        _this.configObjectEvents(_this.levelObjects[obj.group][id]);
      })
    })
  },

  tick: function() { this.applyToObjectGroups('tick') },
  draw: function() { this.applyToObjectGroups('draw', {ordering: 'renderOrder'}) },

  applyToObjectGroups: function(func_name, params) {
    params = params || {};
    obj_types = !params.ordering ? loopery.objectTypes : _.sortBy(loopery.objectTypes, function(obj_type) { return obj_type[params.ordering]; })
    for (var i = 0; i < obj_types.length; i++) {
      object_group = obj_types[i].group;
      for (var id in this.levelObjects[object_group]) {
        this.levelObjects[object_group][id][func_name]();
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

  configObjectEvents: function(obj) {
    // TODO: redo this. I wrote this method just to make mouse.js happy. But that doesn't have to be the case.

    obj.boundEvents = {}

    obj.do = function(evt, pos) {
      if (evt in obj.boundEvents) {
        if (!obj.contains(pos)) { return; }
        obj.boundEvents[evt].forEach(function(func) { func.call(obj, pos); })
      }
    }

    obj.on = function(evt, func) {
      if (!(evt in this.boundEvents)) { this.boundEvents[evt] = []; }
      this.boundEvents[evt].push(func);
    }

    if (obj.bindEvents && typeof obj.bindEvents === 'function') {
      obj.bindEvents();
    }
  }
}
