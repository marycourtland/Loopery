// *********************************************************************
// Menu buttons


function makeEditorButton(pos, label, callback) {
  var button = makeButton(pos, label, callback);
  button._tick = button.tick;
  button.tick = function() {
    if (!game.editor.enabled) { return; }
    this._tick();
  }
  button._draw = button.draw;
  button.draw = function() {
    if (!game.editor.enabled) { return; }
    this._draw();
  }
  button.highlight = function() {
    emptyRect(this.ctx, this.pos, add(this.pos, this.size), 'white');
  }
  return button;
}

game.editor.test_level_tool.button = makeEditorButton(
  xy(15, 40),
  "Test level (NYI)",
  function() { game.editor.setTool(game.editor.test_level_tool); }
);


game.editor.toggle_grid_button = makeEditorButton(
  xy(15, 70),
  "Toggle grid on",
  function() {
    if (game.editor.snap_to_grid) {
      game.editor.snap_to_grid = false;
      game.editor.toggle_grid_button.label = "Toggle grid on";
    }
    else {
      game.editor.snap_to_grid = true;
      game.editor.toggle_grid_button.label = "Toggle grid off";
    }
  }
);

game.editor.clear_all_button = makeEditorButton(
  xy(15, 100),
  "Clear all tracks (NYI)",
  function() {  } // TODO: level editor's "clear all" method
);

game.editor.select_start_tool.button = makeEditorButton(
  xy(15, 130),
  "Choose start point",
  function() { game.editor.setTool(game.editor.select_start_tool); }
);

game.editor.select_end_tool.button = makeEditorButton(
  xy(15, 160),
  "Choose end point",
  function() { game.editor.setTool(game.editor.select_end_tool); }
);

game.editor.circle_tool.button = makeEditorButton(
  xy(15, 220),
  "Circular tracks",
  function() { game.editor.setTool(game.editor.circle_tool); }
);

game.editor.linear_tool.button = makeEditorButton(
  xy(15, 250),
  "Linear tracks",
  function() { game.editor.setTool(game.editor.linear_tool); }
);

game.editor.select_tool.button = makeEditorButton(
  xy(15, 280),
  "Select/Edit",
  function() { game.editor.setTool(game.editor.select_tool); }
);

game.editor.delete_tool.button = makeEditorButton(
  xy(15, 310),
  "Delete",
  function() { game.editor.setTool(game.editor.delete_tool); }
);
