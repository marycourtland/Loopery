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

  loadAndInitObject: function(obj_group, obj_type, obj_data, parent) {
    var obj = this.loadObject(obj_group, obj_type, obj_data);
    this.initObject(obj_group, obj_data, parent);
    return obj;
  },

  loadObject: function(obj_group, obj_type, obj_data) {
    var id = obj_data["id"];
    var ObjectType = loopery[obj_type];
    var lookup = this.getLookupMethod();
    this.levelObjects[obj_group][id] = new ObjectType(id, loopery.ctx, lookup);
    return this.levelObjects[obj_group][id];
  },

  initObject: function(obj_group, obj_data, parent) {
    var id = obj_data.id;
    this.levelObjects[obj_group][id].init(obj_data, parent);

    loopery.objects.push(this.levelObjects[obj_group][id]);
    this.configObjectEvents(this.levelObjects[obj_group][id]);

  },

  removeObject: function(obj) {
    console.debug("Destroying:", obj);
    delete this.levelObjects[obj.group][obj.id];
  },

  loadLevel: function(level_data) {
    var lookup = this.getLookupMethod();
    var _this = this;

    this.clear();

    // Create objects
    loopery.objectTypes.forEach(function(obj) {
      // Only create top-level object types. Child objects will be created by their parents
      if (obj.parent) { return; }

      level_data[obj.group].forEach(function(object_data) {
        _this.loadObject(obj.group, obj.type, object_data)
      })
    })

    // Initialize them
    // *** Since the different object types refer to each other (during initializing), this
    // needs to be totally separate from the object creation
    loopery.objectTypes.forEach(function(obj) {
      if (obj.parent) { return; }

      level_data[obj.group].forEach(function(object_data) {
        _this.initObject(obj.group, object_data);
      })
    })
  },

  // tick: function() { this.applyToObjectGroups('tick'); },
  // draw: function() { this.applyToObjectGroups('draw', {ordering: 'renderOrder'}); },

  tick: function() {
    // check for destroyed objects
    this.forAllObjects(function(obj) {
      if (obj.destroyed) loopery.gameplay.removeObject(obj);
    })

    // trigger tick
    this.triggerForAllObjectGroups('tick', {}, {ordering: 'renderOrder'});
  },

  draw: function() {
    this.triggerForAllObjectGroups('draw', {}, {ordering: 'renderOrder'});
  },

  triggerForAllObjectGroups: function(trigger, data, params) {
    if (!data) { data = {}; }
    if (!params) { params = {}; }
    obj_types = !params.ordering ? loopery.objectTypes : loopery.objectTypes.sortBy(params.ordering);
    for (var i = 0; i < obj_types.length; i++) {
      object_group = obj_types[i].group;
      for (var id in this.levelObjects[object_group]) {
        $(this.levelObjects[object_group][id]).trigger(trigger, data);
      }
    }
  },

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

  forAllObjectsInGroup: function(group, func) {
    for (var loop_id in this.levelObjects[group]) {
      func(this.levelObjects[group][loop_id]);
    }
  },

  forAllObjects: function(func, params) {
    if (!params) { params = {}; }
    obj_types = !params.ordering ? loopery.objectTypes : loopery.objectTypes.sortBy(params.ordering);

    for (var i = 0; i < obj_types.length; i++) {
      this.forAllObjectsInGroup(obj_types[i].group, func);
    }
  },

  getLookupMethod: function() {
    // This method will be given to child objects so that they can lookup junk
    // Possible params:
    // id, group
    // Call lookup(group:"groupname") to get all objs in that group
    var _this = this;
    return function(params) {
      if (typeof params !== 'object') {
        throw 'Error... why did you not call lookup() with a params object???';
      }
      if (params.group in _this.levelObjects) {
        if (params.id === null || params.id === undefined) {
          return _this.levelObjects[params.group]
        }
        else {
          return _this.levelObjects[params.group][params.id] || null;
        }
      }

      if (params.id !== null || params.id === undefined) {
        for (var group in _this.levelObjects) {
          if (params.id in _this.levelObjects[group]) {
            return _this.levelObjects[group][params.id];
          }
        }
      } 
      return null;
    }
  },

  configObjectEvents: function(obj) {
    // TODO: redo this. I wrote this method just to make mouse.js happy. But that doesn't have to be the case.

    obj.boundEvents = {}

    obj.do = function(evt, pos, vel) {
      if (evt in obj.boundEvents) {
        if (!obj.contains(pos)) { return; }
        obj.boundEvents[evt].forEach(function(func) { func.call(obj, pos, vel); })
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
