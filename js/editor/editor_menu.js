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
      'height': '1rem',
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
    "text-align":"right"
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
      off: function() { loopery.gameplay.pause(); $(this).html("&#9654;"); },
      on: function() { loopery.gameplay.resume(); $(this).html("&#9612;&#9612;"); }
    })
    .appendTo(loopery.editor.menu);
})()

loopery.editor.save_button = makeEditorButton(
  "editor-save",
  "Save level",
  function() {
    loopery.editor.saveLevel();
  }
);

loopery.editor.clear_all_button = makeEditorButton(
  "editor-clear",
  "Clear level",
  function() {
    loopery.editor.clearAll();
  }
);

loopery.editor.toggle_grid_button = makeEditorButton("editor-grid", "Grid: off");

loopery.editor.toggle_grid_button.togglebutton({
  off: function() {
    loopery.editor.toggle_grid_button.setLabel("Grid: off");
    loopery.editor.disableGrid();
    $(".grid-number-input").hide();
  },

  triangular: function() {
    loopery.editor.toggle_grid_button.setLabel("Grid: triangular");
    loopery.editor.enableGrid(loopery.editor.grids.triangular);
    $(".grid-number-input").hide();
    $('#grid-size-input').show();
    $('#grid-size-angle-input-triangle').show();
  },

  rectangular: function() {
    loopery.editor.toggle_grid_button.setLabel("Grid: rectangular");
    loopery.editor.enableGrid(loopery.editor.grids.rectangular);
    $(".grid-number-input").hide();
    $('#grid-size-input').show();
  },

  radial: function() {
    loopery.editor.toggle_grid_button.setLabel("Grid: radial");
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

loopery.editor.circle_tool.button = makeEditorButton(
  "editor-circular",
  "Add Loop",
  function() { loopery.editor.setTool(loopery.editor.circle_tool); }
);


loopery.editor.loop_radius_toggle = makeEditorButton("editor-grid", "Loop radius: preset");

loopery.editor.loop_radius_toggle.togglebutton({
  preset: function() {
    loopery.editor.loop_radius_toggle.setLabel("Loop radius: preset");
    loopery.editor.circle_tool.preset_radius = true;
    $("#preset-loop-radius-input").show();
  },

  dynamic: function() {
    loopery.editor.loop_radius_toggle.setLabel("Loop radius: dynamic");
    loopery.editor.circle_tool.preset_radius = false;
    $("#preset-loop-radius-input").hide();
  }
})

loopery.editor.preset_loop_radius_input = makeNumberInput('preset-loop-radius-input', 'Radius:', 40);
loopery.editor.preset_loop_radius_input.appendTo(loopery.editor.menu);


// =======================================================================
addMenuSpacer();

loopery.editor.linear_tool.button = makeEditorButton(
  "editor-linear",
  "Add Connector",
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


// PARAM BOXES
var param_box_style = {
  'position': 'absolute',
  'left': 5,
  'top': 500,
  'width': 150,
  'font-size': 12,
  'color': 'black',
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
      .val("#0000ff")
      .css({display: 'block'})
      .appendTo(orb_params);

    $("<input type='button'>").attr('id', 'new-orb-dir')
      .val('Direction: CW').data('dir', 1)
      .appendTo(orb_params)
      .togglebutton({
        cw: function() { $(this).data('dir', 1).val("Direction: CW"); },
        ccw: function() { $(this).data('dir', -1).val("Direction: CCW"); }
      });

    // Give the new orb various roles
    $("<input type='button'>")
      .addClass('new-orb-role')
      .data('new-orb-role', 'player')
      .appendTo(orb_params)
      .togglebutton({
        off: function() { $(this).val('Player role: OFF'); },
        on: function() { $(this).val('Player role: ON'); }
      })

    $("<input type='button'>")
      .addClass('new-orb-role')
      .data('new-orb-role', 'arm')
      .appendTo(orb_params)
      .togglebutton({
        off: function() { $(this).val('Arm role: OFF'); },
        on: function() { $(this).val('Arm role: ON'); }
      })

    $("<input type='button'>")
      .addClass('new-orb-role')
      .data('new-orb-role', 'enemy')
      .appendTo(orb_params)
      .togglebutton({
        off: function() { $(this).val('Enemy role: OFF'); },
        on: function() { $(this).val('Enemy role: ON'); }
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
})();


loopery.editor.menu.updateLoopInfo = function(params) {
  if (!params) { return; }
  if (params.loop) {
    params.pos = params.loop.loc;
    params.radius = params.loop.radius;
  }
  $("#new-loop-position").text(params.pos.x + ", " + params.pos.y);
  $("#new-loop-radius").text(Math.round(params.radius))
}
