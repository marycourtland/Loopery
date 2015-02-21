loopery.Enemy = function(id, canvas_context, lookup_func) {
  this.__proto__ = new Orb(id, canvas_context, lookup_func);
  
  this.obj_type = 'enemy';

  this.init = function(data) {
    this.__proto__.init(_.extend(data, {
      color: 'black',
      end: null
    }))
  }

  this.getData = function() {
    return {
      id: this.id,
      start: this.start,
      start_dir: this.start_dir
    }
  }

  this.events.collision.onOccur = function() {
    // BLOW UP THE OTHER ORB WOOHOO
  }

  this.events.levelcomplete.hasOccurred = function() {}

  // EVENTS DURING GAMEPLAY
  // the functions should be called with this bound to the orb obj
  this.events = {
    collision: {
      hasOccurred: function() {
        var orbs = this.lookup({group: 'orbs'});
        for (var id in orbs) {
          //if (loopery.state.frame % 100 === 0) { console.log(id, this.id)}
          if (this.isCollidingWith(orbs[id])) { return true; }
        }
        return false;
      },
      onOccur: function() {
        // this should be overridden by subtypes (like enemies)
        // reverse direction!
        this.dir *= -1;
      }
    },

    levelcomplete: {
      hasOccurred: function() {
        // todo
        return false
      },
      onOccur: function() {
        // todo
        console.debug('woohoo, you finished a level')
      }
    }
  }
}
