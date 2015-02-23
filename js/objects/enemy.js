loopery.Enemy = function(id, canvas_context, lookup_func) {
  this.__proto__ = new loopery.Orb(id, canvas_context, lookup_func);
  
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

  $(this).unbind('collision');
  $(this).on('collision', function(evt, data) {
    console.debug('Enemy blows up:', data.orb.color);
    data.orb.blowup();
  })

  $(this).unbind('levelcomplete');
}
