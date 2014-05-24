// Requires math2D.js

// Todo: separate references to the global game var (in the mouse.evt_down)
//    Specifically: when searching for a clicked object, this needs to be done by the game, not the mouse.

MOUSE_DOWN = "mouse down";
MOUSE_UP = "mouse up";
MOUSE_DRAG = "mouse drag";
MOUSE_STILL = "still";
MOUSE_MOVING = "moving";
MOUSE_STOPPED = "stopped";
// After moving, the mouse goes to the 'stopped' state for one frame before going to the 'still' state

function calcMouseCanvasPos(event, canvas) {
  if (navigator.userAgent.match(/Firefox/i)) {
    return xy(event.layerX - canvas.offsetLeft, event.layerY - canvas.offsetTop);
  }
  else if (navigator.userAgent.match(/Chrome/i)) {
    return xy(event.layerX, event.layerY);
  }
  else if (navigator.userAgent.match(/MSIE/i)) {
    return xy(event.x - canvas.offsetLeft, event.y - canvas.offsetTop);
  }
  else {
    // This is the same as the Chrome code
    return xy(event.layerX, event.layerY);
  }
}

function config_mouse(game) {
  mouse = {pos:xy(0, 0), delta:xy(0, 0), velocity:xy(0, 0), motion:MOUSE_STILL, has_new_pos:false, state:MOUSE_UP, ctx: game.ctx};
  
  mouse.update = function() {
    if (!this.has_new_pos) {
      if (this.motion == MOUSE_MOVING) this.motion = MOUSE_STOPPED;
      else {
        this.motion = MOUSE_STILL;
        this.velocity = xy(0, 0);
      }
    }
    this.has_new_pos = false;
  }

  mouse.evt_move = function(event) {
    pos = calcMouseCanvasPos(event, this.ctx.canvas);
    mouse.velocity = add(pos, neg(mouse.pos));
    mouse.pos = pos;
    mouse.has_new_pos = true;
    mouse.motion = MOUSE_MOVING;
    
    if (mouse.state == MOUSE_DOWN) {
      mouse.state = MOUSE_DRAG;
    }
    if (mouse.state == MOUSE_DRAG) {
      if (this.clicked_object) this.clicked_object.ondrag(mouse.velocity);
    }
  }
  mouse.evt_down = function(event) {
    this.state = MOUSE_DOWN;
    // Pass the mousedown to the frontmost handle-able object
    
    for (var i=0; i < game.objects.length; i++) {
      obj = game.objects[i]
      if (obj.contains && obj.contains(this.pos) && !(obj.level && obj.level.id !== game.current_level)) {
        this.clicked_object = obj;
      }
    }
    if (this.clicked_object) {
      this.clicked_object.onmousedown(this.pos);
    }
  }
  mouse.evt_up = function(event) {
    // GameObject onclick event
    if (this.state == MOUSE_DOWN && this.clicked_object)
      this.clicked_object.onclick(this.pos);
    
    // GameObject onmouseup event
    if (this.clicked_object)
      this.clicked_object.onmouseup(this.pos);
    
    this.state = MOUSE_UP;
    this.clicked_object = null;
  }
  
  game.mouse = mouse;
  game.ctx.canvas.addEventListener("mousemove", function(event) { game.mouse.evt_move(event); });
  game.ctx.canvas.addEventListener("mousedown", function(event) { game.mouse.evt_down(event); });
  game.ctx.canvas.addEventListener("mouseup", function(event) { game.mouse.evt_up(event); });
  
}

// Calling this function on a GameObject ensures that clicks are passed to its child objects
// The object must have a array of child objects
// (Sorry about the long name)
function config_container_mouse_evts(parent) {
  parent.clicked_object = null;
  parent.ondrag = function() {
  }
  parent.onmousedown = function(pos) {
    for (var i = 0; i < this.children.length; i++) { 
      obj = this.children[i]
      if (obj.contains && obj.contains(pos)) this.clicked_object = obj;
    }
    if (this.clicked_object) {
      this.clicked_object.onmousedown(pos);
    }
  }
  parent.onmouseup = function(pos) {
    // GameObject onclick event
    if (this.clicked_object)
      this.clicked_object.onclick(pos);
    
    // GameObject onmouseup event
    if (this.clicked_object)
      this.clicked_object.onmouseup(pos);
      
    this.clicked_object = null;
  }
}
