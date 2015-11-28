// The game
var loopery = new Game({bg_color: "#071500"});
loopery.setTitle("Loopery");
loopery.setSize(xy(1000, 800));
loopery.center = xy(500, 600);

// Two canvases: background/foreground
// todo: refactor into layers in game.js
loopery.canvas_bg = $("#game_canvas_bg")[0];
loopery.canvas_bg.style.backgroundColor = 'transparent';
loopery.canvas.style.backgroundColor = 'transparent';
loopery.canvas_bg.width = loopery.size.x;
loopery.canvas_bg.height = loopery.size.y;
loopery.ctx_bg = loopery.canvas_bg.getContext('2d');
loopery.state.redraw_bg = true; // todo: unhackify this


loopery.bg = $("#game_bg")[0];
$("#game_bg").css({
  backgroundColor: loopery.display.bg_color,
  width: loopery.size.x,
  height: loopery.size.y,
})

window.onload = function() {
  loopery.start();
}

// the sole purpose of having loopery.objects is for the mouse to access them
// TODO: refactor that
// also the level editor uses the GameObject stuff which uses this
loopery.objects = [];

loopery.disable_gameplay = false;

// ========== GAME STAGES
loopery.stages.titlescreen = {
  tick: function() {
    clear(loopery.ctx);
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
    clear(loopery.ctx);
    loopery.levelMenu.tick();
    loopery.levelMenu.draw();
    loopery.next();
  },
  stageStart: function() { $("#level_menu").show(); },
  stageEnd: function() { $("#level_menu").hide(); }
} 

loopery.stages.gameplay = {
  tick: function() {
    clear(loopery.ctx);
    loopery.hidePointer();
    loopery.gameplay.tick();
    if (loopery.presentation && loopery.presentation.running) { loopery.presentation.tick(); }
    if (loopery.state.redraw_bg) { clear(loopery.ctx_bg); }
    loopery.gameplay.draw();
    if (loopery.presentation && loopery.presentation.running) { loopery.presentation.draw(); }
    loopery.state.redraw_bg = false;
    loopery.next();
  },
  stageStart: function() { $("#hud").show(); },
  stageEnd: function() {
    $("#hud").hide();
    if (loopery.presentation) { clear(loopery.presentation.ctx); }
  }
}

loopery.stages.editor = {
  // piggyback on the gameplay stage
  tick: function() {
    clear(loopery.ctx);
    loopery.gameplay.tick();
    loopery.editor.tick();
    if (loopery.state.redraw_bg) { clear(loopery.ctx_bg); }

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

  clear(loopery.ctx_bg);
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


$(document).ready(function() {
  $("#game_fadeout").hide(); // start with the fadeout layer hidden (i.e. game is not faded out)
  $("#level_loader").hide();  

  // Initial stage
  loopery.setStage('levelmenu')
  // loopery.setStage('editor')
})

