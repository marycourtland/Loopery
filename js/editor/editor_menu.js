// *********************************************************************
// Menu buttons

loopery.editor.menu = $("<div id='editor_menu'></div>")
  .css({
    position: 'absolute',
    left: '20px',
    color: 'white',
    width: '3.5em',
    'font-family': 'sans-serif'
  })
  .appendTo(document.body)
  .hide();

function makeEditorButton(id, label, callback) {
  var button = $("<a href='javascript:void(0)' class='editor-button'></a>")
    .attr('id', id)
    .css({
      'display': 'inline-block',
      'margin-top': 5,
      'background-color': '#3C4E38',
      'padding': 5,
      'width': 120,
      'height': '1rem',
      'font-size': 12,
      'text-align': 'center'
    })
    .text(label);

  if (typeof callback === 'function')  {
    button.on('click', callback)
  }

  return button;
}

$.fn.highlight = function() {
  $('.editor-button').css('background-color', '#3C4E38');
  // this.css('background-color', '#575');

  $('.editor-button').css('border', '0px');
  this.css('border', '1px solid white');
}

function makeNumberInput(id, label, default_value) {
  var container = $("<div></div>")
    .attr('id', id)
    .css({
      "margin-top":10,
      "width":130
    });

  $("<span>")
    .text(label)
    .css({
      "font-size":12,
      "width": "70%"
    }).appendTo(container);

  $("<input>").css({
    "font-size":12,
    "width":"20%",
    "float":"right",
    "text-align":"right",
    "padding-right":3
  }).val(default_value).appendTo(container);

  return container;
}


function addMenuSpacer(height) {
  height = height || '1rem';
  var spacer = $("<div>")
  .css({'height': height})
  .appendTo(loopery.editor.menu);
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
    $togglebutton.data('togglebutton-state', states[current_state]);
    callbacks[states[current_state]].call(this);
  })

  return this;
};



// =======================================================================

// Start making the menu

// Gameplay pause/resume button
(function() {
  $("<div>")
    .attr('id', 'gameplay-pause-resume')
    .css({
      'padding': 5,
      'width': '3em',
      'text-align': 'center',
      'cursor': 'pointer',
      'background-color': '#3C4E38',
      'color': 'white',
    })
    .togglebutton({
      off: function() {
        // turn off gameplay and go back to normal editing mode
        loopery.gameplay.resetLevel();
        loopery.gameplay.pause();
        $(this).html("&#9654;");
      },
      on: function() {
        // turn on gameplay, leave normal editing mode
        loopery.gameplay.resume();
        $(this).html("&#9612;&#9612;");
      }
    })
    .appendTo(loopery.editor.menu);
})()

loopery.editor.save_button = makeEditorButton(
  "editor-save",
  "Save level",
  function() {
    loopery.editor.saveLevel();
  }
).appendTo(loopery.editor.menu);

loopery.editor.load_button = makeEditorButton(
  "editor-load",
  "Load level",
  function() {
    $("#level_load").show();
  }
).appendTo(loopery.editor.menu);

loopery.editor.clear_all_button = makeEditorButton(
  "editor-clear",
  "Clear level",
  function() {
    loopery.editor.clearAll();
  }
).appendTo(loopery.editor.menu);

// Toggle loop ids
loopery.editor.toggle_loop_ids = makeEditorButton("editor-loop-ids").appendTo(loopery.editor.menu);

loopery.editor.toggle_loop_ids.togglebutton({
  off: function() {
    loopery.editor.toggle_loop_ids.text("Loop IDs: off");
    loopery.editor.hideLoopIds();
  },

  on: function() {
    loopery.editor.toggle_loop_ids.text("Loop IDs: on");
    loopery.editor.showLoopIds();
  }
})


loopery.editor.toggle_grid_button = makeEditorButton("editor-grid", "Grid: off").appendTo(loopery.editor.menu);

loopery.editor.toggle_grid_button.togglebutton({
  off: function() {
    loopery.editor.toggle_grid_button.text("Grid: off");
    loopery.editor.disableGrid();
    $(".grid-number-input").hide();
  },

  triangular: function() {
    loopery.editor.toggle_grid_button.text("Grid: triangular");
    loopery.editor.enableGrid(loopery.editor.grids.triangular);
    $(".grid-number-input").hide();
    $('#grid-size-input').show();
    //$('#grid-size-angle-input-triangle').show();
  },

  rectangular: function() {
    loopery.editor.toggle_grid_button.text("Grid: rectangular");
    loopery.editor.enableGrid(loopery.editor.grids.rectangular);
    $(".grid-number-input").hide();
    $('#grid-size-input').show();
  },

  radial: function() {
    loopery.editor.toggle_grid_button.text("Grid: radial");
    loopery.editor.enableGrid(loopery.editor.grids.radial);
    $(".grid-number-input").hide();
    $('#grid-size-input').show();
    $('#grid-size-angle-input-radial').show();
  },
})

loopery.editor.grid_size_input = makeNumberInput('grid-size-input', 'Grid size:', 40);
loopery.editor.grid_size_input.appendTo(loopery.editor.menu).addClass('grid-number-input').hide();

loopery.editor.grid_angle_input_triangle = makeNumberInput('grid-size-angle-input-triangle', 'Angle (deg):', 60);
loopery.editor.grid_angle_input_triangle.appendTo(loopery.editor.menu).addClass('grid-number-input').hide();

loopery.editor.grid_angle_input_radial = makeNumberInput('grid-size-angle-input-radial', 'Angle (deg):', 10);
loopery.editor.grid_angle_input_radial.appendTo(loopery.editor.menu).addClass('grid-number-input').hide();

$(".grid-number-input").find('input').on('change', function() {
  loopery.editor.grid.redraw();
})

// =======================================================================
addMenuSpacer();

loopery.editor.select_tool.button = makeEditorButton(
  "editor-select",
  "Select/Edit",
  function() { loopery.editor.setTool(loopery.editor.select_tool); }
).appendTo(loopery.editor.menu);

loopery.editor.delete_tool.button = makeEditorButton(
  "editor-delete",
  "Delete",
  function() { loopery.editor.setTool(loopery.editor.delete_tool); }
).appendTo(loopery.editor.menu);

loopery.editor.cycle_tool.button = makeEditorButton(
  "editor-cycles",
  "View cycles",
  function() { loopery.editor.setTool(loopery.editor.cycle_tool); }
).appendTo(loopery.editor.menu);

loopery.editor.path_tool.button = makeEditorButton(
  "editor-paths",
  "Find paths",
  function() { loopery.editor.setTool(loopery.editor.path_tool); }
).appendTo(loopery.editor.menu);

addMenuSpacer();

loopery.editor.circle_tool.button = makeEditorButton(
  "editor-circular",
  "Add Loop",
  function() { loopery.editor.setTool(loopery.editor.circle_tool); }
).appendTo(loopery.editor.menu);


loopery.editor.linear_tool.button = makeEditorButton(
  "editor-linear",
  "Add Connector",
  function() { loopery.editor.setTool(loopery.editor.linear_tool); }
).appendTo(loopery.editor.menu);

loopery.editor.orb_tool.button = makeEditorButton(
  "editor-orb",
  "Add Orb",
  function() { loopery.editor.setTool(loopery.editor.orb_tool); }
).appendTo(loopery.editor.menu);


// =======================================================================
addMenuSpacer();

// PARAM BOXES
var param_box_style = {
  'width': 130,
  'font-size': 12,
  'color': 'white',
};

var param_box_property_style = {
  'float': 'right'
};

// ------------------------------------------------------------------
// Some orb parameters

(function() {
  var orb_params = $("<div id='editor-orb-params'></div>")
    .css(param_box_style)
    .append("<div>Orb properties:</div>")
    .hide()
    .appendTo(loopery.editor.menu);

    $("<input type='color'>").attr('id', 'new-orb-color')
      .val("#00ff00")
      .css({display: 'block', background: 'transparent', 'margin-top':5})
      .appendTo(orb_params);

    makeEditorButton("new-orb-dir")
      .data('dir', 1)
      .appendTo(orb_params)
      .togglebutton({
        cw: function() { $(this).data('dir', 1).text("Direction: CW"); },
        ccw: function() { $(this).data('dir', -1).text("Direction: CCW"); }
      });

    // Give the new orb various roles

    makeEditorButton("new-orb-role-player")
      .addClass('new-orb-role')
      .data('new-orb-role', 'player')
      .appendTo(orb_params)
      .togglebutton({
        off: function() { $(this).text('Player role: OFF'); },
        on: function() { $(this).text('Player role: ON'); }
      })

    makeEditorButton("new-orb-role-clock")
      .addClass('new-orb-role')
      .data('new-orb-role', 'clock')
      .appendTo(orb_params)
      .togglebutton({
        off: function() { $(this).text('Clock role: OFF'); },
        on: function() { $(this).text('Clock role: ON'); }
      })

    makeEditorButton("new-orb-role-enemy")
      .addClass('new-orb-role')
      .data('new-orb-role', 'enemy')
      .appendTo(orb_params)
      .togglebutton({
        off: function() { $(this).text('Enemy role: OFF'); },
        on: function() { $(this).text('Enemy role: ON'); }
      })

  })();


function showOrbRoleParams() {
  console.log('add new role');
}


// ------------------------------------------------------------------
// Loop parameters

(function() {
  var loop_params = $("<div id='editor-loop-params'></div>")
    .css(param_box_style)
    .append("<div>Loop properties:</div>")
    .hide()
    .appendTo(loopery.editor.menu);

    // var propert

  $("<div>")
    .text("Position: ")
    .append($("<span>").attr('id', 'new-loop-position').css(param_box_property_style))
    .appendTo(loop_params);

  $("<div>")
    .text("Radius: ")
    .append($("<span>").attr('id', 'new-loop-radius').css(param_box_property_style))
    .appendTo(loop_params);



  loopery.editor.loop_radius_toggle = makeEditorButton("editor-grid", "Loop radius: preset");

  loopery.editor.loop_radius_toggle.togglebutton({
    preset: function() {
      loopery.editor.loop_radius_toggle.text("Loop radius: preset");
      loopery.editor.circle_tool.preset_radius = true;
      $("#preset-loop-radius-input").show();
    },

    dynamic: function() {
      loopery.editor.loop_radius_toggle.text("Loop radius: dynamic");
      loopery.editor.circle_tool.preset_radius = false;
      $("#preset-loop-radius-input").hide();
    }
  }).appendTo(loop_params);

  loopery.editor.preset_loop_radius_input = makeNumberInput('preset-loop-radius-input', 'Radius:', 60);
  loopery.editor.preset_loop_radius_input.appendTo(loop_params);
})();


loopery.editor.menu.updateLoopInfo = function(params) {
  if (!params) { return; }
  if (params.loop) {
    params.pos = params.loop.loc;
    params.radius = params.loop.radius;
  }
  var pos = vround(params.pos, 1)
  $("#new-loop-position").text(pos.x + ", " + pos.y);
  $("#new-loop-radius").text(Math.round(params.radius))
}
