function GameAnimation(ctx, timestep, draw_func) {
  var anim = GameObject(ctx);
  anim.enabled = false,
  anim.paused = false;
  anim.step = 0;
  anim.timestep = timestep;
  anim.drawFrame = draw_func;
  
  anim.tickActions.push(function() {
    if (!this.enabled || this.paused) return;
    if (mod(game.frame, this.timestep) == 0) this.step += 1;
  });
  
  anim.draw = function() {
    if (!this.enabled) return;
    this.drawFrame();
  }
  
  anim.enable = function() { this.enabled = true; }
  anim.disable = function() { this.step = 0; this.enabled = false; }
  
  anim.pause = function() { this.paused = true; }
  anim.resume = function() { this.paused = false; }
  anim.reset = function() { this.step = 0; }
   
  return anim;
}