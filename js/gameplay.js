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

  current_level: 0,

  paused: false,

  animations: [],

  clear: function() {
    var _this = this;
    loopery.objectTypes.forEach(function(obj) {
      _this.levelObjects[obj.group] = {};
    });
    draw.clear(loopery.ctx);
    draw.clear(loopery.ctx_bg);
    if (loopery.presentation && loopery.presentation.ctx) { draw.clear(loopery.presentation.ctx); }
    this.hideAllMessages();
  },

  completeLevel: function() {
    loopery.markLevelSolved(this.current_level);
    this.showLevelComplete();
  },

  hideAllMessages: function() {
    this.hideLevelComplete();
    this.hideLevelFailed();
  },

  showLevelComplete: function() {
    $("#game_fadeout").fadeIn();
    $("#level_complete").fadeIn();
    this.pause();
  },

  hideLevelComplete: function() {
    $("#game_fadeout").hide();
    $("#level_complete").hide();
    this.resume();
  },

  showLevelFailed: function(message) {
    if (message) {
      $("#level_failed h2").text(message);
    }
    $("#game_fadeout").fadeIn();
    $("#level_failed").fadeIn();
    this.pause();
  },

  hideLevelFailed: function() {
    $("#game_fadeout").hide();
    $("#level_failed").hide();
    this.resume();
  },

  resetLevel: function() {
    this.forAllObjects(function(obj) {
      if (typeof obj.reset === 'function') {
        obj.reset();
      }
    });
    this.initPlayerEnabledJoints();
    this.hideAllMessages();
  },

  loadAndInitObject: function(obj_group, obj_type, obj_data, parent) {
    var obj = this.loadObject(obj_group, obj_type, obj_data);
    this.initObject(obj_group, obj_data, parent);
    return obj;
  },

  loadObject: function(obj_group, obj_type, obj_data) {
    var id = obj_data["id"];
    var ObjectType = loopery[obj_type];
    var ctx = loopery[loopery.objectTypesByGroup[obj_group].ctx];
    this.levelObjects[obj_group][id] = new ObjectType(id, ctx, loopery.gameplay.lookup);
    return this.levelObjects[obj_group][id];
  },

  initObject: function(obj_group, obj_data, parent) {
    var id = obj_data.id;
    this.levelObjects[obj_group][id].init(obj_data, parent);

    loopery.objects.push(this.levelObjects[obj_group][id]);
    this.configObjectEvents(this.levelObjects[obj_group][id]);
  },

  removeObject: function(obj) {
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
    this.current_level = level_data.info.index;

    var lookup = loopery.gameplay.lookup;
    var _this = this;
    var max_id = 0;

    this.clear();

    // Create objects
    loopery.objectTypes.forEach(function(obj) {
      // Only create top-level object types. Child objects will be created by their parents
      if (obj.parent) { return; }

      level_data[obj.group].forEach(function(object_data) {
        var new_obj = _this.loadObject(obj.group, obj.type, object_data);
        max_id = (new_obj.id > max_id) ? new_obj.id : max_id;
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

    if (loopery.features.clickersOnlyOnPlayerLoops) {
      this.initPlayerEnabledJoints();
    }

    if (loopery.editor) {
      loopery.editor.next_id = max_id + 1;
    }

    loopery.state.redraw_bg = true;

    if (loopery.presentation) {
      var tips = [];
      var orbs = this.lookup({group:'orbs'});
      for (var id in orbs) {
        if (orbs[id].roles.player) {
          tips.push({
            initialpos: 0,
            oldpos: 0.001,
            pos: 0.001,
            dir: 1,
            track: orbs[id].track
          })
        }
      }
      loopery.presentation.start(tips, function() {});
    }
  },

  getLevelData: function() {
    var data = {
      info: { name: 'TODO: save level name...' }
    };
    loopery.gameplay.forAllGroups(function(group) {
      data[group] = [];
      loopery.gameplay.forAllObjectsInGroup(group, function(obj) {
        if (typeof obj.getData !== 'function') { return; } // this handles the editor's resizer hack
        data[group].push(obj.getData());
      })
    })
    return data;
  },

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

    this.animations.forEach(function(animation) { animation.draw(); })
  },

  initPlayerEnabledJoints: function() {
    // When a player orb switches loops, we need to enable the joints on the new loop, etc.
    // Todo: this could be optimized a tiny bit by disabling/enabling only joints that need changing.
    // (instead of disabling all of them and re-enabling all relevant ones)

    this.disableAllJoints();

    var orbs = this.lookup({group:'orbs'});
    for (var id in orbs) {
      var orb = orbs[id];

      // only enable joints for player orbs
      if (!orb.roles.player) { continue; }

      if (orb.track.group === 'loops') {
        this.enableJointsOnLoop(orb.track, orb.dir);
      }
      else if (orb.track.group === 'connectors') {
        // enable clickers for loops on both sides of a connector
        var joint_behind = (orb.dir === 1) ? orb.track.joints[1] : orb.track.joints[0];
        var joint_ahead = (orb.dir === 1) ? orb.track.joints[0] : orb.track.joints[1];

        this.enableJointsOnLoop(joint_behind.loop, -joint_behind.winding);
        this.enableJointsOnLoop(joint_ahead.loop, joint_ahead.winding);
      }

      // ok enable all the joints
      var joints = this.lookup({group:'joints', loop_id: orb.track.id});
      for(var id in joints) {

        // but only if they're going in the right direction
        if (joints[id].winding !== orb.dir) { continue; }

        joints[id].enable();
      }
    }
  },

  disableAllJoints: function() {
    this.forAllObjectsInGroup('joints', function(joint) {
      joint.disable();
    })
  },

  enableAllJoints: function() {
    this.forAllObjectsInGroup('joints', function(joint) {
      joint.enable();
    })
  },

  enableJointsOnLoop: function(loop, dir) {
    // if dir is specified, only enable joints for orbs going in that direction on the loop
    var joints = this.lookup({group:'joints', loop_id: loop.id});
    joints.forEach(function(joint) {
      if (typeof dir !== 'undefined' && joint.winding !== dir) { return; }
      joint.enable();
    })
  },

  disableJointsOnLoop: function(loop) {
    var joints = this.lookup({group:'joints', loop_id: loop.id});
    joints.forEach(function(joint) {
      joint.disable();
    })
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

  forAllGroups: function(func) {
    loopery.objectTypes.forEach(function(type) {
      func(type.group);
    })
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

    obj.boundEvents = {};

    obj.do = function(evt, pos, vel) {
      if (evt in obj.boundEvents) {
        if (!obj.contains(pos) && evt !== 'drag') { return; }
        obj.boundEvents[evt].forEach(function(func) { func.call(obj, pos, vel); })
      }
      return this;
    }

    obj.on = function(evt, func) {
      if (!(evt in this.boundEvents)) { this.boundEvents[evt] = []; }
      this.boundEvents[evt].push(func);
      return this;
    }

    obj.off = function(evt) {
      delete this.boundEvents[evt];
      return this;
    }

    if (obj.bindEvents && typeof obj.bindEvents === 'function') {
      obj.bindEvents();
    }
  }

}
