loopery.sound = {

  assets: {
    'button': {
      path: 'button.mp3',
      loop: false,
      autostart: false,
      volume: 0.30
    },
    'soundtrack': {
      path: 'loopery.mp3',
      loop: true,
      autostart: false,
      volume: 0.07
    },
    'connector': {
      path: 'railroad.mp3',
      loop: true,
      autostart: false,
      volume: 0.05
    },
    'joint': {
      path: 'laser.wav',
      loop: false,
      autostart: false,
      volume: 0.05
    },
    'win': {
      path: 'scramble.mp3',
      loop: true,
      autostart: false,
      volume: 0.08
    },
    'explode': {
      path: 'burnup.mp3',
      loop: false,
      autostart: false,
      volume: 0.1
    }
  },

  on: true,

  load: function(callback) {
    var q = new createjs.LoadQueue();
    q.installPlugin(createjs.Sound);

    q.addEventListener("loadstart", function() {});

    q.addEventListener("complete", function() {
      if (typeof callback === 'function') { callback() };
      $("#turn-sound-on").hide();
      $("#turn-sound-off").show();
      loopery.sound.init();
    });

    for (var id in this.assets) {
      q.loadFile({id:id, src:this.assets[id].path});
    }
  },

  init: function() {
    this.sounds = {};
    for (var id in this.assets) {
      var data = this.assets[id];

      // Start looping sounds right away and pause them
      if (data.loop && this.assets[id].autostart) {
        this.refreshSound(id);
      }
    }
  },

  turnOff: function() {
    if (!this.on) return;

    $("#turn-sound-off").hide();
    $("#turn-sound-on").show();
    this.on = false;

    for (var id in this.assets) {
      // previous pause value is already cached
      this.refreshSound(id);
    }
  },

  turnOn: function() {
    if (this.on) return;

    $("#turn-sound-off").show();
    $("#turn-sound-on").hide();
    this.on = true;

    for (var id in this.assets) {
      // this will restore previous pause value
      this.refreshSound(id);
    }
  },

  // Turn sound on or off appropriately
  refreshSound: function(id) {
    if (!this.assets[id]) return;

    if (!this.assets[id].sound) {
      this.assets[id].sound = createjs.Sound.play(id, 'none', 0, 0, (this.assets[id].loop ? -1 : 0 ));
      this.assets[id].sound.volume = this.assets[id].volume;
      this.assets[id].paused = false; 
    }

    if (!this.on) {
      this.assets[id].sound.paused = true;
    }
    else {
      try {
        this.assets[id].sound.paused = this.assets[id].paused;
      }
      catch(e) {
        console.warn(e);
      }
    }
  },

  // Sound-specific methods
  //   Start / stop are for continuous sounds/music with loop=true
  //   Play is for one-off sound effects (no looping, regardless of id)

  start: function(id) {
    if (this.assets[id]) {
      this.assets[id].paused = false;
      this.refreshSound(id);
    }
    else {
      console.warn('No sound exists for id ' + id);
    }
  },

  stop: function(id) {
    if (this.assets[id] && this.assets[id].sound) {
      this.assets[id].paused = true;
      this.refreshSound(id);
    }
    else {
      console.warn('No sound exists for id ' + id);
    }
  },

  play: function(id) {
    if (this.assets[id]) {
      var sound = createjs.Sound.play(id, 'none', 0, 0, 0);
      sound.volume = this.assets[id].volume;
    }
    else {
      console.warn('No sound exists for id ' + id);
    }
  },

  isPlaying: function(id) {
    console.log('isPlaying?', this.on , this.assets[id] , this.assets[id].sound , (this.assets[id].sound ? !this.assets[id].sound.paused : '--'));
    return this.on && this.assets[id] && this.assets[id].sound && !this.assets[id].sound.paused;
  }
}
