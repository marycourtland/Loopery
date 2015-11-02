// *********************************************************************
// Menu buttons

loopery.editor.menu = $("<div id='editor_menu'></div>")
  .css({
    position: 'absolute',
    left: (loopery.size.x + 10) + 'px',
    color: 'black',
    width: '3.5em'
  })
  .appendTo(document.body)
  .hide();

function makeEditorButton(id, label, callback) {
  var button = $("<a href='#' class='editor-button'></a>")
    .attr('id', id)
    .css({
      'display': 'inline-block',
      'margin-top': 10,
      'background-color': '#222222',
      'padding': 5,
      'width': 120,
      'font-size': 12,
      'text-align': 'center'
    })
    .text(label)
    .appendTo(loopery.editor.menu);

  if (typeof callback === 'function')  {
    button.on('click', callback)
  }

  button.tick = function() {};
  button.draw = function() {};

  button.setLabel = function(label) {
    this.text(label);
  }

  button.highlight = function() {
    $('.editor-button').css('border', '0px');
    this.css('border', '1px solid white');
  }
  return button;
}

// utility: binary toggle buttons
$.fn.togglebutton = function(callbacks) {
  // Assume initial state is the first one
  var current_state = 0;
  var states = Object.keys(callbacks);
  callbacks[states[current_state]].call(this);

  this.data('togglebutton-state', states[current_state]).on('click', function() {
    $togglebutton = $(this);
    current_state += 1;
    current_state %= states.length;
    $togglebutton.data('togglebutton-state');
    callbacks[states[current_state]].call(this);
  })

  return this;
};

(function() {
  $("<div>")
    .css({
      'padding': 5,
      'width': '3em',
      'text-align': 'center',
      'cursor': 'pointer',
      'background-color': 'black',
      'color': 'white',
    })
    .togglebutton({
      off: function() { loopery.gameplay.pause(); this.html("&#9654;"); },
      on: function() { loopery.gameplay.resume(); this.html("&#9612;&#9612;"); }
    })
    .appendTo(loopery.editor.menu);
})()

// `TODO
// loopery.editor.save_level_button = makeEditorButton(
//   xy(15, 40),
//   'editor-save',
//   'Save level',
//   function() {
    
//   }
// )


loopery.editor.toggle_grid_button = makeEditorButton("editor-grid", "Grid: off");

loopery.editor.toggle_grid_button.togglebutton({
  off: function() {
    loopery.editor.toggle_grid_button.setLabel("Grid: off");
    loopery.editor.disableGrid();
  },

  rectangular: function() {
    loopery.editor.toggle_grid_button.setLabel("Grid: rectangular");
    loopery.editor.enableGrid(loopery.editor.grids.rectangular);
  },

  radial: function() {
    loopery.editor.toggle_grid_button.setLabel("Grid: radial");
    loopery.editor.enableGrid(loopery.editor.grids.radial);
  }
})

loopery.editor.clear_all_button = makeEditorButton(
  "editor-clear",
  "Clear all tracks (NYI)",
  function() {  } // TODO: level editor's "clear all" method
);

loopery.editor.circle_tool.button = makeEditorButton(
  "editor-circular",
  "Circular tracks",
  function() { loopery.editor.setTool(loopery.editor.circle_tool); }
);

loopery.editor.linear_tool.button = makeEditorButton(
  "editor-linear",
  "Linear tracks",
  function() { loopery.editor.setTool(loopery.editor.linear_tool); }
);

loopery.editor.select_tool.button = makeEditorButton(
  "editor-select",
  "Select/Edit",
  function() { loopery.editor.setTool(loopery.editor.select_tool); }
);

loopery.editor.delete_tool.button = makeEditorButton(
  "editor-delete",
  "Delete",
  function() { loopery.editor.setTool(loopery.editor.delete_tool); }
);

loopery.editor.orb_tool.button = makeEditorButton(
  "editor-orb",
  "New Orb",
  function() { loopery.editor.setTool(loopery.editor.orb_tool); }
);

// Some orb parameters

(function() {
  var orb_params = $("<div id='editor-orb-params'>Params</div>")
    .css({
      'position': 'absolute',
      'left': 15,
      'top': 370,
      'font-size': 14,
      'color': 'black'
    })
    .text("Orb properties:")
    .hide()
    .appendTo(loopery.editor.menu);

    $("<input type='color'>").attr('id', 'new-orb-color')
      .val("#0000ff")
      .appendTo(orb_params);

    $("<input type='button'>").attr('id', 'new-orb-dir')
      .val('Direction: CW').data('dir', 1)
      .appendTo(orb_params)
      .togglebutton({
        cw: function() { this.data('dir', 1).val("Direction: CW"); },
        ccw: function() { this.data('dir', -1).val("Direction: CCW"); }
      });

    // Give the new orb various roles
    $("<input type='button'>")
      .addClass('new-orb-role')
      .data('new-orb-role', 'player')
      .appendTo(orb_params)
      .togglebutton({
        off: function() { this.val('Player role: OFF'); },
        on: function() { this.val('Player role: ON'); }
      })

    $("<input type='button'>")
      .addClass('new-orb-role')
      .data('new-orb-role', 'arm')
      .appendTo(orb_params)
      .togglebutton({
        off: function() { this.val('Arm role: OFF'); },
        on: function() { this.val('Arm role: ON'); }
      })

    $("<input type='button'>")
      .addClass('new-orb-role')
      .data('new-orb-role', 'enemy')
      .appendTo(orb_params)
      .togglebutton({
        off: function() { this.val('Enemy role: OFF'); },
        on: function() { this.val('Enemy role: ON'); }
      })

    function getOrbRoles() {
      return $(".new-orb-role")
        .filter(function() { return $(this).data('on') })
        .map(function() { return $(this).data('new-orb-role'); });
    }
  })();


function showOrbRoleParams() {
  console.log('add new role');
}