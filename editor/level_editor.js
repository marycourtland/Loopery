// When you enter the level editor:
// - a new, empty level is created and game.custom_level is set to it
// - it's added to game.custom_levels
// - game.editor is enabled (via game.enableEditor())
// - game.editor is a GameObject, but all of its methods should return if the editor isn't enabled
//   (i.e. game.editor.enabled is true)

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

game.editor = new GameObject(game);

game.editor.enabled = false;
game.enableEditor = function() {
  if (game.editor.enabled) {
    game.editor.setTool(game.editor.current_tool);
  }
  else {
    game.editor.enabled = true;
    game.editor.setTool(game.editor.circle_tool);
  }
  game.editor.custom_level = makeLevel(game, game.levels.length);
  game.current_level = game.editor.custom_level.id;
  game.disable_gameplay = true;
}

game.disableEditor = function() {
  if (this.editor.current_tool) this.editor.current_tool.end();
  this.editor.enabled = false;
  game.disable_gameplay = false;
}

game.editor.setTool = function(tool) {
  if (this.current_tool) this.current_tool.end();
  this.current_tool = tool;
  this.current_tool.start();
  this.current_tool.states[this.current_tool.current_state].onenter();
}

game.editor.draw = function() {
  if (!this.enabled) return;
  this.drawGrid();
  this.current_tool.states[this.current_tool.current_state].draw();
  this.current_tool.button.highlight();
  
  // Menu labels
  text(this.ctx, "LEVEL EDITOR", xy(15, 20), "nw");
  text(this.ctx, "Tools", xy(15, 200), "nw");
}

game.editor.tick = function() {
}

// Clicks will make a tool transition to the next state.
game.onclick(function() {
  if (!game.editor.enabled) return;
  if (game.menu.contains(mouse.pos)) return;
  tool = game.editor.current_tool;
  tool.states[tool.current_state].onleave();
  tool.current_state = tool.states[tool.current_state].next_state;
  tool.states[tool.current_state].onenter();
});
