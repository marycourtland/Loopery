// When you enter the level editor:
// - a new, empty level is created and loopery.custom_level is set to it
// - it's added to loopery.custom_levels
// - loopery.editor is enabled (via loopery.enableEditor())
// - loopery.editor is a GameObject, but all of its methods should return if the editor isn't enabled
//   (i.e. loopery.editor.enabled is true)

// Tools:
// - Tool to create new circular track (lets you click twice to position the center and edge)
// - Tool to create new linear track (lets you click two circles to position the track)
// - Select/edit tool (lets you drag circles around and change their size and drag linear tracks around)
// - Delete tool (guess what this does!)


loopery.editor = new GameObject(loopery);

loopery.editor.enabled = false;
loopery.enableEditor = function() {
  if (loopery.editor.enabled) {
    loopery.editor.setTool(loopery.editor.current_tool);
  }
  else {
    loopery.editor.enabled = true;
    loopery.editor.setTool(loopery.editor.circle_tool);
  }

  loopery.editor.menu.show();

  loopery.editor.next_id = 0;

  // Piggyback on the loopery.gameplay object to render everything
  // Start out with the blank_level.json level
  loopery.gameplay.loadLevel({
    info: {
      name: "",
      index: -1
    },
    loops: [],
    connectors: [],
    joints: [],
    orbs: [],
    decorations: []
  });
  // loopery.loadLevelData('levels/blank_level.json', function(level_data) {
  //   loopery.gameplay.loadLevel(level_data);
  // });

  loopery.gameplay.pause();
}

loopery.editor.saveLevel = function() {
  var level_output = JSON.stringify(loopery.gameplay.getLevelData());
  var download_data = "text/json;charset=utf-8," + encodeURIComponent(level_output);
  $("#level_output").text(level_output);
  $("#level_download")
    .attr('href', 'data:' + download_data)
    .attr('download', "level.json");
  $("#level_save").show();
}

loopery.editor.hideSaver = function() {
  $("#level_save").hide();
}

loopery.editor.showLoader = function() {
  $("#level_input").val("");
  $("#level_load").show();
}

loopery.editor.hideLoader = function() {
  $("#level_load").hide();
}

loopery.editor.loadLevel = function(level_json) {
  var level_json = $("#level_input").val();
  try {
    var level_data = JSON.parse(level_json);
  }
  catch(exception) {
    console.log('JSON error while loading level:', exception);
    return;
  }
  loopery.editor.hideLoader();

  loopery.gameplay.loadLevel(level_data);
  loopery.gameplay.pause();
  
  // Make sure all the loops are clickable
  loopery.gameplay.forAllObjectsInGroup('loops', function(loop) {
    loopery.editor.initSelection(loop);
  })
}

loopery.editor.clearAll = function() {
  loopery.gameplay.forAllObjects(function(obj) {
    loopery.gameplay.removeObject(obj)
  });
  loopery.editor.next_id = 0;
}

loopery.disableEditor = function() {
  if (this.editor.current_tool) this.editor.current_tool.end();
  this.editor.enabled = false;
  loopery.disable_gameplay = false;
  loopery.editor.menu.hide();
  loopery.mouse.snap(false);
}

loopery.editor.getNextId = function() {
  this.next_id += 1;
  return this.next_id;
}

loopery.editor.setTool = function(tool) {
  if (this.current_tool) this.current_tool.end();
  this.current_tool = tool;
  this.current_tool.start();
  this.current_tool.states[this.current_tool.current_state].onenter();
}

loopery.editor.draw = function() {
  if (!this.enabled) return;
  this.current_tool.states[this.current_tool.current_state].draw();
  this.current_tool.button.highlight();
  if (loopery.editor.settings.show_loop_ids) {
    loopery.editor.drawLoopIds();
  }
}

loopery.editor.tick = function() {

  if ('tick' in this.current_tool.states[this.current_tool.current_state]) {
    this.current_tool.states[this.current_tool.current_state].tick();
  }
  this.clicked_tracks = [];

  loopery.state.redraw_bg = true; // do this every frame for the editor
}

loopery.editor.clicked_tracks = [];

loopery.editor.last_click = null;

// Clicks will make a tool transition to the next state.
loopery.onclick(function() {
  loopery.editor.last_click = loopery.mouse.pos;
  if (!loopery.editor.enabled) { return; }
  var tool = loopery.editor.current_tool;
  tool.states[tool.current_state].onleave();
  tool.current_state = tool.states[tool.current_state].next_state;
  tool.states[tool.current_state].onenter();
});

loopery.editor.initSelection = function(track) {
  track.on("click", function(loc) {
    loopery.editor.clicked_tracks.push(this);
  }) 
}

// Settings
// todo: move other setting things to here
loopery.editor.settings = {
  show_loop_ids: false
}

loopery.editor.showLoopIds = function() { loopery.editor.settings.show_loop_ids = true; }
loopery.editor.hideLoopIds = function() { loopery.editor.settings.show_loop_ids = false; }

loopery.editor.drawLoopIds = function() {
  loopery.gameplay.forAllObjectsInGroup('loops', function(loop) {
    draw.text(loopery.ctx, loop.id.toString(), loop.loc, 'centered');
  })
}

// KEYBOARD SHORTCUTS

loopery.editor.keyboard_shortcuts = {
  "L" : function() { loopery.editor.setTool(loopery.editor.circle_tool); },
  "C" : function() { loopery.editor.setTool(loopery.editor.linear_tool); },
  "S" : function() { loopery.editor.setTool(loopery.editor.select_tool); },
  "D" : function() { loopery.editor.setTool(loopery.editor.delete_tool); },
  "O" : function() { loopery.editor.setTool(loopery.editor.orb_tool); },
  "Q" : function() { loopery.editor.setTool(loopery.editor.cycle_tool); },
  "E" : function() { loopery.editor.setTool(loopery.editor.path_tool); },
  "G" : function() { $("#editor-grid").trigger('click'); },
  "SPACE" : function(evt) {
    evt.stopPropagation();
    $("#gameplay-pause-resume").trigger('click');
  },
}

window.addEventListener("keyup", function(event) {
  key = getKeyFromEvent(event);
  if (key in loopery.editor.keyboard_shortcuts) {
    loopery.editor.keyboard_shortcuts[key](event);
  }
});

