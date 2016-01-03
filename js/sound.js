loopery.sound = {

  assets: {
    'soundtrack': 'loopery.wav'
  },

  soundtrack: null, // will be initialized
  on: true,

  load: function(callback) {
    var q = new createjs.LoadQueue();
    q.installPlugin(createjs.Sound);

    q.addEventListener("loadstart", function() {
    });

    q.addEventListener("complete", function() {
      if (typeof callback === 'function') { callback() };
      $("#turn-sound-on").hide();
      $("#turn-sound-off").show();
      loopery.sound.initSoundtrack();
    });

    for (var id in this.assets) {
      q.loadFile({id:id, src:this.assets[id]});

    }
  },

  initSoundtrack: function() {
    this.soundtrack = createjs.Sound.play('soundtrack', 'none', 0, 0, -1);
    this.soundtrack.volume = 0.07;
  },

  turnOff: function() {
    this.soundtrack.paused = true;
    $("#turn-sound-off").hide();
    $("#turn-sound-on").show();
    this.on = false;
  },

  turnOn: function() {
    this.soundtrack.paused = false;
    $("#turn-sound-off").show();
    $("#turn-sound-on").hide();
    this.on = true;
  }
}


