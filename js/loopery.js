// The game
var loopery = new Game({bg_color: "#071500"});
loopery.setTitle("Loopery");

loopery.refreshGameElements = function() {
  var window_area = xy(window.innerWidth, window.innerHeight);
  loopery.setSize(window_area);
  loopery.center = scale(window_area, 0.5);

  loopery.layers = [];

  // Two canvases: background/foreground
  loopery.canvas_bg = $("#game_canvas_bg")[0];
  loopery.ctx_bg = loopery.canvas_bg.getContext('2d');
  loopery.state.redraw_bg = true; // todo: unhackify this

  loopery.configLayer(loopery.ctx);
  loopery.configLayer(loopery.ctx_bg);
}

loopery.configLayer = function(layer_context) {
  layer_context.canvas.style.backgroundColor = 'transparent';
  layer_context.canvas.width = loopery.size.x;
  layer_context.canvas.height = loopery.size.y;
  layer_context.font = loopery.display.font.size.toString() + "px " + loopery.display.font.type;
  layer_context.fontsize = loopery.display.font.size;

  // Set 0, 0 to the center
  layer_context.translate(loopery.size.x/2, loopery.size.y/2);
}

loopery.requestCanvas = function(size) {
  // Deliver a canvas intended for drawing 1 object
  // should be done on level initialization

  var canvas = document.createElement('canvas');
  canvas.width = size.x;
  canvas.height = size.y;
  canvas.className = 'game-obj-canvas';
  loopery.repr_layer.appendChild(canvas);
  
  // Set 0, 0 to the center
  canvas.getContext('2d').translate(canvas.width/2, canvas.height/2);

  canvas.setPosition = function(loc) {
    this.style.left = (loc.x + loopery.size.x/2 - this.width/2) + 'px';
    this.style.top = (loc.y + loopery.size.y/2 - this.height/2) + 'px';
  }

  return canvas;
}

loopery.refreshGameElements();


loopery.bg = $("#game_bg")[0];
$("#game_bg").css({
  backgroundColor: loopery.display.bg_color,
  width: loopery.size.x,
  height: loopery.size.y,
})

loopery.repr_layer = $("#game_reprs")[0];


// the sole purpose of having loopery.objects is for the mouse to access them
// TODO: refactor that
// also the level editor uses the GameObject stuff which uses this
loopery.objects = [];

loopery.disable_gameplay = false;

// ========== GAME STAGES
loopery.stages.titlescreen = {
  tick: function() {
    draw.clear(loopery.ctx);
    loopery.setFont(loopery.display.font_title);
    draw.text(loopery.ctx, loopery.title, xy(400, 150), "centered");
    loopery.setFont(loopery.display.font_large, "italic");
    draw.text(loopery.ctx, "Click to continue", xy(400, 250), "centered");
    loopery.next();
    //setTimeout(function() { loopery.exitTitlescreen(); }, 1*1000);
  }
}

loopery.stages.levelmenu = {
  tick: function() {
    // nothing?
    loopery.next();
  },
  stageStart: function() { $("#level_menu").show(); },
  stageEnd: function() { $("#level_menu").hide(); }
}

loopery.stages.gameplay = {
  tick: function() {
    loopery.recordTime();
    loopery.hidePointer();
    loopery.gameplay.tick();
    loopery.gameplay.draw();

    loopery.next();
  },
  stageStart: function() { $("#hud").show(); },
  stageEnd: function() {
    loopery.gameplay.clear();
    $("#hud").hide();
    $('.game-repr').remove();
    if (loopery.presentation) { draw.clear(loopery.presentation.ctx); }
  }
}

loopery.stages.editor = {
  // piggyback on the gameplay stage
  tick: function() {
    loopery.recordTime();
    draw.clear(loopery.ctx);
    loopery.gameplay.tick();
    loopery.editor.tick();
    if (loopery.state.redraw_bg) { draw.clear(loopery.ctx_bg); }

    loopery.gameplay.draw();
    loopery.editor.draw();
    loopery.state.redraw_bg = false;
    loopery.next();
  },
  stageStart: function() { loopery.enableEditor(); },
  stageEnd: function() { }
}


// ========== Stage-switching methods
loopery.setStage = function(stage_name) {
  if (!(stage_name in loopery.stages)) { return; }

  if (loopery.currentStage && typeof loopery.currentStage.stageEnd === 'function') { loopery.currentStage.stageEnd(); }
  loopery.currentStage = loopery.stages[stage_name];
  if (loopery.currentStage && typeof loopery.currentStage.stageStart === 'function') { loopery.currentStage.stageStart(); }

  draw.clear(loopery.ctx_bg);
  loopery.state.redraw_bg = true;
}

loopery.startGameplay = function(level_index) {
  if (!(level_index in loopery.levels)) { return; }
  var level_data = loopery.levels[level_index].data;
  loopery.setStage('gameplay');
  loopery.gameplay.loadLevel(level_data);
}

loopery.ctx.canvas.addEventListener("click", function(event) {
  if (loopery.currentStage === loopery.stages.titlescreen) { loopery.setStage('levelmenu'); }
})

loopery.restart = function() {
  loopery.current_level = 0;
  loopery.setStage('titlescreen');
}

loopery.startCurrentLevel = function() {
  loopery.levels[loopery.current_level].onload();
}


// ========== Inirect html/css access
loopery.showPointer = function() {
  $("body").css("cursor", "pointer");
}
loopery.hidePointer = function() {
  $("body").css("cursor", "auto");
}

// ========== Local storage
loopery.localStorageSet = function(key, value) {
  if (!window.localStorage) { return; }
  var data = loopery.localStorage();
  data[key] = value;
  window.localStorage.loopery_data = JSON.stringify(data);
}
loopery.localStorageGet = function(key) {
  if (!window.localStorage) { return undefined; }
  var data = loopery.localStorage();
  return data[key];
}

loopery.localStorage = function() {
  if (!window.localStorage) { return {}; }
  if (!('loopery_data' in window.localStorage)) { 
    window.localStorage.loopery_data = '{}';
  }
  return JSON.parse(window.localStorage.loopery_data);
}


// ========== Time management
loopery.recent_times = [];
loopery.calculateFPS = function() {
  var sum = loopery.recent_times.reduce(function(sum, next) { return sum + next; }, 0);
  var frames_per_ms = loopery.recent_times.length / sum;
  return frames_per_ms * 1000;
}

loopery.recordTime = function() {
  // track fps
  var current_time = (new Date()).valueOf();
  loopery.state.dt = current_time - loopery.state.time;
  loopery.recent_times.push(loopery.state.dt);
  if (loopery.recent_times.length > 20) { loopery.recent_times.shift(); }
  loopery.state.time = current_time;
  loopery.state.actual_fps = loopery.calculateFPS();
}

loopery.getFrameSpeed = function(speed) {
  return speed * loopery.state.dt / 1000;
}



// ========== Schedule one-off procedures to be executed during the gameloop

loopery.tickCallbacks = {};
loopery.onNextTick = function(callback) {
  var next_frame = (this.state.frame || 0) + 1;
  if (!(next_frame in loopery.tickCallbacks)) {
    loopery.tickCallbacks[next_frame] = [];
  }
  loopery.tickCallbacks[next_frame].push(callback);

}

loopery.ontick(function() {
  if (loopery.state.frame in loopery.tickCallbacks) {
    loopery.tickCallbacks[loopery.state.frame].forEach(function(cb) { cb(); })
    delete loopery.tickCallbacks[loopery.state.frame];
  }
})



// ========== GOGOGO

function go() {
  $("#loading").fadeOut();
  $("#game").fadeIn()
  loopery.setStage('levelmenu');
  loopery.start();
}


$(document).ready(function() {
  $("#game_fadeout").hide(); // start with the fadeout layer hidden (i.e. game is not faded out)
  $("#level_loader").hide();
  $("#game").hide();

  if (loopery.sound) {
    loopery.sound.load(function() {
      go();
    }); 
  }
  else {
    go();
  }
})
