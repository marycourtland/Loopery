// *********************************************************************
// Menu buttons

loopery.editor.menu = $("<div id='editor_menu'></div>")
  .css({
    position: 'absolute',
    left: (loopery.size.x + 10) + 'px'
  })
  .appendTo(document.body)
  .hide();

function makeEditorButton(pos, id, label, callback) {
  var button = $("<a href='#' class='editor-button'></a>")
    .attr('id', id)
    .css({
      'display': 'inline-block',
      'position': 'absolute',
      'left': pos.x,
      'top': pos.y,
      'background-color': '#222222',
      'padding': 5,
      'width': 120,
      'font-size': 12,
      'text-align': 'center'
    })
    .text(label)
    .on('click', callback)
    .appendTo(loopery.editor.menu);

  button.tick = function() {};
  button.draw = function() {};

  button.setLabel = function(label) {
    this.text(label);
  }

  button.highlight = function() {
    //emptyRect(this.ctx, this.pos, add(this.pos, this.size), 'white');
    $('.editor-button').css('border', '0px');
    this.css('border', '1px solid white');
  }
  return button;
}

// loopery.editor.save_level_button = makeEditorButton(
//   xy(15, 40),
//   'editor-save',
//   'Save level',
//   function() {
    
//   }
// )

loopery.editor.test_level_tool.button = makeEditorButton(
  xy(15, 40),
  "editor-test",
  "Test level (NYI)",
  function() { loopery.editor.setTool(loopery.editor.test_level_tool); }
);


loopery.editor.toggle_grid_button = makeEditorButton(
  xy(15, 70),
  "editor-grid",
  "Toggle grid on",
  function() {
    if (loopery.editor.snap_to_grid) {
      loopery.editor.snap_to_grid = false;
      loopery.editor.toggle_grid_button.setLabel("Toggle grid on");
    }
    else {
      loopery.editor.snap_to_grid = true;
      loopery.editor.toggle_grid_button.setLabel("Toggle grid off");
    }
  }
);

loopery.editor.clear_all_button = makeEditorButton(
  xy(15, 100),
  "editor-clear",
  "Clear all tracks (NYI)",
  function() {  } // TODO: level editor's "clear all" method
);

loopery.editor.select_start_tool.button = makeEditorButton(
  xy(15, 130),
  "editor-start",
  "Choose start point",
  function() { loopery.editor.setTool(loopery.editor.select_start_tool); }
);

loopery.editor.select_end_tool.button = makeEditorButton(
  xy(15, 160),
  "editor-end",
  "Choose end point",
  function() { loopery.editor.setTool(loopery.editor.select_end_tool); }
);

loopery.editor.circle_tool.button = makeEditorButton(
  xy(15, 220),
  "editor-circular",
  "Circular tracks",
  function() { loopery.editor.setTool(loopery.editor.circle_tool); }
);

loopery.editor.linear_tool.button = makeEditorButton(
  xy(15, 250),
  "editor-linear",
  "Linear tracks",
  function() { loopery.editor.setTool(loopery.editor.linear_tool); }
);

loopery.editor.select_tool.button = makeEditorButton(
  xy(15, 280),
  "editor-select",
  "Select/Edit",
  function() { loopery.editor.setTool(loopery.editor.select_tool); }
);

loopery.editor.delete_tool.button = makeEditorButton(
  xy(15, 310),
  "editor-delete",
  "Delete",
  function() { loopery.editor.setTool(loopery.editor.delete_tool); }
);

loopery.editor.orb_tool.button = makeEditorButton(
  xy(15, 340),
  "editor-orb",
  "New Orb",
  function() { loopery.editor.setTool(loopery.editor.orb_tool); }
);
