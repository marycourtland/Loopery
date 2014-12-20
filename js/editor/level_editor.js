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


// TODOS:
// - A "clear all" function/button
// - Select/edit tool
//    - Let designer resize circles
// - Delete tool
// - Display something that indicates which tool is the current tool
// - Display informative text showing how to use the tool
// - Let the designer choose the gridsize
// - Let the designer try out the game
// - Let the designer choose starting and ending tracks

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

  loopery.editor.next_id = 0;

  // Piggyback on the loopery.gameplay object to render everything
  // Start out with the blank_level.json level
  loopery.loadLevelData('levels/blank_level.json', function(level_data) {
    loopery.gameplay.loadLevel(level_data);
  });
}

loopery.disableEditor = function() {
  if (this.editor.current_tool) this.editor.current_tool.end();
  this.editor.enabled = false;
  loopery.disable_gameplay = false;
}

loopery.editor.setTool = function(tool) {
  console.log('Setting tool to:', tool)
  if (this.current_tool) this.current_tool.end();
  this.current_tool = tool;
  this.current_tool.start();
  this.current_tool.states[this.current_tool.current_state].onenter();
}

loopery.editor.draw = function() {
  // console.log('editor draw');
  if (!this.enabled) return;
  this.drawGrid();
  this.current_tool.states[this.current_tool.current_state].draw();
  this.current_tool.button.highlight();
  
  // Menu labels
  draw.text(this.ctx, "LEVEL EDITOR", xy(15, 20), "nw");
  draw.text(this.ctx, "Tools", xy(15, 200), "nw");
}

loopery.editor.tick = function() {
}

// Clicks will make a tool transition to the next state.
loopery.onclick(function() {
  if (!loopery.editor.enabled) { return; }
  var tool = loopery.editor.current_tool;
  tool.states[tool.current_state].onleave();
  tool.current_state = tool.states[tool.current_state].next_state;
  tool.states[tool.current_state].onenter();
});
