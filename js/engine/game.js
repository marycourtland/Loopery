function Game(params) {
  
  // Initialize game settings
  if (params == null) params = {};
  this.fps = 60,
  this.t0 = new Date().getTime(),
  this.mouse = null,
  this.display = {
    bg_color: params.bg_color? params.bg_color : 'white',
    font: null
  },
  this.state = {
    win: false,
    frame: 0
  },
  this.currentStage = null,
  this.objects = [],
  this.addObject = function(obj) { this.objects.push(obj); }
  this.setSize = function(size) {
    this.size = size;
    this.canvas.width = size.x;
    this.canvas.height = size.y;
  }
  
  this.setTitle = function(title) {
    this.title = title;
    window.document.title = title;
  }
  this.setFont = function(font, stylestring) {
    if (!stylestring) stylestring = "";
    this.display.font = font;
    this.ctx.font = stylestring + " " + this.display.font.size.toString() + "px " + this.display.font.type;
    this.ctx.fontsize = this.display.font.size;
  }
  
  // Create game canvas
  if (window.document.getElementById("game_canvas") == null) {
    this.canvas = window.document.createElement("canvas");
    window.document.body.appendChild(this.canvas);
  } else {
    this.canvas = window.document.getElementById("game_canvas")
  }
  this.canvas.style.backgroundColor = this.display.bg_color;

  // Initialize canvas context
  this.ctx = this.canvas.getContext("2d");
  
  this.setFont(params.font? params.font : {size: 18, type: 'Arial'});
  this.setSize(params.size? params.size : xy(600,400));
  this.setTitle(params.title? params.title : "New Game");
  config_mouse(this);
  config_keyboard(this);
  
  
  // Game loop
  this.start = function() {
    iter(this.objects, function(obj) { if (obj.kind.indexOf('dynamic') == -1) actuate(obj); });
    this.setFont(this.display.font);
    this.next();
  }
  this.tick = function() {
    this.state.frame++;
    this.mouse.update();
    for (var i = 0; i < this.tickActions.length; i++) {
      this.tickActions[i].call(this);
    }
    this.currentStage();
    for (var i = 0; i < this.finalActions.length; i++) {
      this.finalActions[i].call(this);
    }
    
  }
  this.tickActions = [];
  this.ontick = function(tick_func) { this.tickActions.push(tick_func); }
  
  this.finalActions = [];
  this.onfinal = function(final_func) { this.finalActions.push(final_func); }
  
  this.next = function() {
    var _this = this;
    if (!this.win) setTimeout(function() { _this.tick() }, 1000/_this.fps);
  }

  // Game stages
  this.stages = {};

  // this.stages.titlescreen = function() {
  //   clear(this.ctx);
  //   var old_font = this.display.font;
  //   this.setFont({size: 36, type: 'Arial'});
  //   draw.text(this.ctx, this.title, "center", "centered");
  //   this.setFont(old_font);
  //   var _this = this;
  //   setTimeout(function() { _this.currentStage = _this.gameplay; _this.next(); }, 5*1000);
  // }
  // this.stages.gameplay = function() {
  //   clear(this.ctx);
  //   if (this.isKeyPressed("L")) {}
  //   iter(this.objects, function(obj) { obj.tick(); });
  //   iter(this.objects, function(obj) { obj.draw(); });
  //   this.next();
  // }
  
  
  // this.currentStage = this.stages.gameplay; // default stages
  
  // GAME EVENTS
  this.onclick = function(callback) {
    this.ctx.canvas.addEventListener("click", callback);
  }
  
  this.onmousedown = function(callback) {
    this.ctx.canvas.addEventListener("mousedown", callback);
  }
  
  this.onclick(function() { console.log("Clicked at " + mouse.pos); })
}

