function Animation(num_frames, draw_callback, end_callback) {
  this.frames_remaining = num_frames;
  this.started = false;
  draw_callback = draw_callback || function() {};
  end_callback = end_callback || function() {};

  this.draw = function() {
    if (!this.started) { return; }

    draw_callback(loopery.state.frame - this.frame0);

    this.frames_remaining -= 1;

    if (this.frames_remaining < 1) {
      this.end();
    }
  }

  this.start = function() {
    this.frame0 = loopery.state.frame;
    this.started = true;
  }

  this.end = function() {
    var index = loopery.gameplay.animations.indexOf(this);
    loopery.gameplay.animations.splice(index, 1);
    end_callback();
  }

  loopery.gameplay.animations.push(this);
}