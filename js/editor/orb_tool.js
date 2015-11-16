// *********************************************************************
// Tool to put orbs on tracks
loopery.editor.orb_tool = {};

loopery.editor.orb_tool.params = {
  loop: null,
};

// Resets the tool (called when player chooses the tool)
loopery.editor.orb_tool.start = function() {
  this.current_state = "choose_loop";
  $("#editor-orb-params").show();
}

loopery.editor.orb_tool.end = function() {
  loopery.display.shade_hovered_circle_track = false;
  $("#editor-orb-params").hide();
}

loopery.editor.orb_tool.complete = function(loop, pos) {
  // Make the orb
 
  var orb_data = {
    id: loopery.editor.getNextId(),
    color: $("#new-orb-color").val(),
    start: loop.id,
    start_dir: $("#new-orb-dir").data('dir'),
    start_pos: pos,
    roles: {}
  };

  // Determine which roles the orb has. TODO: get role-specific data
  var roles = $(".new-orb-role")
    .filter(function() { return $(this).data('togglebutton-state') === 'on'; })
    .map(function() { return $(this).data('new-orb-role'); })
    .toArray();

  roles.forEach(function(role) {
    orb_data.roles[role] = {}; // THIS IS WHERE ROLE-SPECIFIC DATA WILL GO
  })

  var orb = loopery.gameplay.loadAndInitObject('orbs', 'Orb', orb_data);

  // todo: click detection

  // Reset the params
  this.params.loop = null;
}

// Tool states
loopery.editor.orb_tool.states = {
  choose_loop: {
    onenter: function() {
      loopery.display.shade_hovered_circle_track = true;
    },
    
    draw: function() {
    },
    
    onleave: function() {
      loopery.editor.orb_tool.states.choose_loop.next_state = "choose_loop";

      if (loopery.editor.clicked_tracks.length > 0) {
        loopery.editor.orb_tool.params.loop = loopery.editor.clicked_tracks[0];
        loopery.editor.orb_tool.states.choose_loop.next_state = "choose_position";
      }
    },
    next_state: "choose_position"
  },
  
  choose_position: {
    onenter: function() {
    },
    
    draw: function() {
      // draw fake orb in the spot closest to the mouse
      var loop_center = loopery.editor.orb_tool.params.loop.loc;
      var loop_radius = loopery.editor.orb_tool.params.loop.radius;
      var angle_to_mouse = subtract(loopery.mouse.pos, loop_center).th;
      var pos = add(loop_center, rth(loop_radius, angle_to_mouse));
      var color = $("#new-orb-color").val();
      draw.circle(loopery.ctx, pos, loopery.display.orb_radius, {
        fill: color,
        lineWidth: 0,
        stroke: color
      })

      if ($("#new-orb-role-enemy").data('togglebutton-state') === 'on') {
        // spikes for enemies (pass in a mock orb)
        loopery.Orb.Roles.enemy.drawSpikes({
          getLoc: function() { return pos; },
          color: color,
          ctx: loopery.ctx
        });  
      }
      
    },
    
    onleave: function() {
      var pos = loopery.editor.orb_tool.params.loop.getPosFromLoc(loopery.mouse.pos);
      loopery.editor.orb_tool.complete(loopery.editor.orb_tool.params.loop, pos);
    },
    
    next_state: "choose_loop"
  }
}
