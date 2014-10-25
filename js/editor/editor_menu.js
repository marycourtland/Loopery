// *********************************************************************
// Menu buttons


function makeEditorButton(pos, label, callback) {
  var button = loopery.levelMenu.makeButton(pos, label, callback);
  button._tick = button.tick;
  button.tick = function() {
    if (!loopery.editor.enabled) { return; }
    this._tick();
  }
  button._draw = button.draw;
  button.draw = function() {
    if (!loopery.editor.enabled) { return; }
    this._draw();
  }
  button.highlight = function() {
    emptyRect(this.ctx, this.pos, add(this.pos, this.size), 'white');
  }
  return button;
}

loopery.editor.test_level_tool.button = makeEditorButton(
  xy(15, 40),
  "Test level (NYI)",
  function() { loopery.editor.setTool(loopery.editor.test_level_tool); }
);


loopery.editor.toggle_grid_button = makeEditorButton(
  xy(15, 70),
  "Toggle grid on",
  function() {
    if (loopery.editor.snap_to_grid) {
      loopery.editor.snap_to_grid = false;
      loopery.editor.toggle_grid_button.label = "Toggle grid on";
    }
    else {
      loopery.editor.snap_to_grid = true;
      loopery.editor.toggle_grid_button.label = "Toggle grid off";
    }
  }
);

loopery.editor.clear_all_button = makeEditorButton(
  xy(15, 100),
  "Clear all tracks (NYI)",
  function() {  } // TODO: level editor's "clear all" method
);

loopery.editor.select_start_tool.button = makeEditorButton(
  xy(15, 130),
  "Choose start point",
  function() { loopery.editor.setTool(loopery.editor.select_start_tool); }
);

loopery.editor.select_end_tool.button = makeEditorButton(
  xy(15, 160),
  "Choose end point",
  function() { loopery.editor.setTool(loopery.editor.select_end_tool); }
);

loopery.editor.circle_tool.button = makeEditorButton(
  xy(15, 220),
  "Circular tracks",
  function() { loopery.editor.setTool(loopery.editor.circle_tool); }
);

loopery.editor.linear_tool.button = makeEditorButton(
  xy(15, 250),
  "Linear tracks",
  function() { loopery.editor.setTool(loopery.editor.linear_tool); }
);

loopery.editor.select_tool.button = makeEditorButton(
  xy(15, 280),
  "Select/Edit",
  function() { loopery.editor.setTool(loopery.editor.select_tool); }
);

loopery.editor.delete_tool.button = makeEditorButton(
  xy(15, 310),
  "Delete",
  function() { loopery.editor.setTool(loopery.editor.delete_tool); }
);
