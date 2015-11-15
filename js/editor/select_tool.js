// *********************************************************************
// Tool to select/edit things
loopery.editor.select_tool = {};

loopery.editor.select_tool.params = {
  selected_object: null
}

loopery.editor.select_tool.select = function(obj) {
  this.params.selected_object = obj;

  if (obj.group === 'loops' && loopery.editor.current_tool === loopery.editor.select_tool) {
    console.log('Showing selected')
    $("#editor-loop-params").show();
    loopery.editor.menu.updateLoopInfo({loop: obj});
  }
}


// ---------------------------------------------------------------------
// Resizer
// A little resizing handle object that allows the person to change radius of a circle track

loopery.editor.select_tool.resizer = new GameObject(loopery);
loopery.editor.select_tool.resizer.type = 'resizer';
loopery.editor.select_tool.resizer.radius = loopery.display.track_width * 2;

loopery.editor.select_tool.resizer.contains = function(pos) {
  return distance(pos, this.pos) < this.radius;
}

loopery.editor.select_tool.resizer.tick = function() {
  if (!loopery.editor.select_tool.params.selected_object) { return; }
  var track = loopery.editor.select_tool.params.selected_object;
  var track_center = track.loc;

  if (this.dragging) {
    this.pos = loopery.mouse.pos.copy();
    track.radius = distance(this.pos, track_center);
    loopery.editor.menu.updateLoopInfo({loop: track});
  }
  else {
    // Put the handle on the relevant circle track, but in the spot closest to the mouse
    var track_radius = track.radius;
    var angle_to_mouse = subtract(loopery.mouse.pos, track_center).th;
    this.pos = add(track_center, rth(track_radius, angle_to_mouse));
  }

  this.dragging = false;
};


loopery.editor.select_tool.resizer.draw = function() {
  if (!loopery.editor.select_tool.params.selected_object) { return; }

  var track_pos = loopery.editor.select_tool.params.selected_object.getPosFromLoc(this.pos);
  var th1 = (track_pos - 0.25) * 2*Math.PI;
  var th2 = (track_pos + 0.25) * 2*Math.PI;

  draw.arc(loopery.ctx, this.pos, this.radius, th1, th2, {
    fill: loopery.display.track_color,
    linewidth: 0,
    stroke:'white'
  })
};
loopery.editor.select_tool.params.selected_object

loopery.gameplay.configObjectEvents(loopery.editor.select_tool.resizer);

loopery.editor.select_tool.resizer.on('mousedown', function() { this.dragging = true; });
loopery.editor.select_tool.resizer.on('drag', function() { this.dragging = true; });


// ---------------------------------------------------------------------
// Tool states  

// Resets the tool (called when player chooses the tool)
loopery.editor.select_tool.start = function() {
  this.current_state = "default_state";
  loopery.display.shade_hovered_circle_track = true;
  loopery.editor.select_tool.params.selected_object = null;
  loopery.gameplay.forAllObjectsInGroup('loops', loopery.editor.select_tool.configLoopEvents);


  // plop the resizer into the main game level as a decoration (..this is a hack!)
  loopery.editor.select_tool.resizer.id = -1;
  loopery.editor.select_tool.resizer.group = 'decorations';
  loopery.gameplay.levelObjects.decorations[-1] = loopery.editor.select_tool.resizer;
}

loopery.editor.select_tool.end = function() {
  loopery.display.shade_hovered_circle_track = false;
  loopery.editor.select_tool.params.selected_object = null;
  loopery.gameplay.forAllObjectsInGroup(loopery.editor.select_tool.removeLoopEvents);

  // clean up resizer object
  loopery.gameplay.removeObject(loopery.editor.select_tool.resizer);

  $("#editor-loop-params").hide();
}

loopery.editor.select_tool.configLoopEvents = function(loop) {
  // meh
  loop.on('mousedown', function() {
    loopery.editor.select_tool.select(this);
  })
  loop.on('drag', function(pos, vel) {
    loopery.editor.select_tool.select(this);
    loop.loc.add(vel);
  })
}

loopery.editor.select_tool.removeLoopEvents = function(loop) {
  // todo
}

// Tool states
loopery.editor.select_tool.states = {
  default_state: {
    onenter: function() {},
    tick: function() {
      loopery.editor.select_tool.resizer.tick();
    },
    draw: function() {
      if (loopery.editor.select_tool.params.selected_object) {
        loopery.editor.select_tool.resizer.draw();
        loopery.editor.select_tool.params.selected_object.show_shade = true;
      }
    },
    onleave: function() {
    },
    next_state: "default_state"
  }
}
