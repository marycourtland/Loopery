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

  paused: false,

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
    this.levelObjects[obj_group][id] = new ObjectType(id, loopery.ctx, loopery.gameplay.lookup);
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
    if (!(obj.id in this.levelObjects[obj.group])) {
      console.warn('Tried to remove an object not in this level:', obj.group, obj.id);
      return;
    }
    delete this.levelObjects[obj.group][obj.id];

    // Also delete attached stuff...

    var lookupAndRemove = function(params) {
      var objs = loopery.gameplay.lookup(params);
      for (var id in objs) { loopery.gameplay.removeObject(objs[id]); }
    };

    if (obj.group === 'loops') {
      lookupAndRemove({loop_id: obj.id, group: 'connectors'});
      lookupAndRemove({loop_id: obj.id, group: 'orbs'});
    }

    if (obj.group === 'connectors') {
      lookupAndRemove({loop_id: obj.id, group: 'joints'});
      lookupAndRemove({loop_id: obj.id, group: 'orbs'});
    }

    obj = null; // release memory
  },

  loadLevel: function(level_data) {
    var lookup = loopery.gameplay.lookup;
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

  pause: function() {
    this.paused = true;
  },

  resume: function() {
    this.paused = false;
  },

  tick: function() {
    if (this.paused) { return; }
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

  getAllObjects: function() {
    var objs = {};
    loopery.objectTypes.forEach(function(type) {
      for (var id in loopery.gameplay.levelObjects[type.group]) {
        objs[id] =  loopery.gameplay.levelObjects[type.group][id];
      }
    })
    return objs;
  },

  getConnectorsForLoop: function(loop) {
    for (var id in this.levelObjects.connectors) {
      this.levelObjects.connectors[id].joints[0]
    }
  },


  lookup: function(params) {
    // `CRUNCH: this could be condensed - see all the join blocks

    if (typeof params !== 'object') {
      throw 'Error... why did you not call lookup() with a params object???';
    }

    var results = ('group' in params) ? loopery.gameplay.levelObjects[params.group] : loopery.gameplay.getAllObjects();

    if ('id' in params) {
      return results[params.id];
    }

    // 
    var joins = [
      // Loop > all connectors attached to it
      {
        source: 'loop',
        target: 'connector',
        matchTarget: function(loop_id, connector) {
          var joints = connector.joints;
          if (joints[0].loop.id === params.loop_id) { return true; }
          if (joints[1].loop.id === params.loop_id) { return true; }
          return false;
        }
      },

      // Loop > all joints on it
      {
        source: 'loop',
        target: 'joint',
        matchTarget: function(loop_id, joint) {
          return joint.loop.id === loop_id;
        }
      },

      // Loop > all orbs on it
      {
        source: 'loop',
        target: 'orb',
        matchTarget: function(track_id, orb) {
          return orb.track.id === track_id;
        }
      },

      // Connector > all orbs on it
      {
        source: 'connector',
        target: 'orb',
        matchTarget: function(track_id, orb) {
          return orb.track_id === track_id;
        }
      }
    ]

    joins.forEach(function(join) {
      var id_name = join.source + '_id';
      if ('group' in params && params.group.match(join.target) && id_name in params) {
        var target_results = [];
        for (var id in results) {
          var target = results[id];
          if (join.matchTarget(params[id_name], target)) { target_results.push(target); }
        }
        results = target_results;
      }
    })

    return results;
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
