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

loopery.editor.orb_tool.complete = function(loop, pos, extras) {
  // Make the orb
  extras = extras || {};

  var orb_data = {
    id: loopery.editor.getNextId(),
    color: $("#new-orb-color").val(),
    start: loop.id,
    start_dir: $("#new-orb-dir").data('dir'),
    start_pos: pos,
    roles: {}
  };

  role = loopery.editor.orb_tool.getSelectedRole();

  if (role) orb_data.roles[role] = {};

  // HERE WILL HAPPEN: Filling orb_data.roles['player']
  if ('player' in orb_data.roles) {
    orb_data.roles.player.end = extras.player_end_loop_id;
  }

  var orb = loopery.gameplay.loadAndInitObject('orbs', 'Orb', orb_data);

  // todo: click detection

  // Reset the params
  this.params.loop = null;
}


loopery.editor.orb_tool.getSelectedRole = function() {
  // Determine which roles the orb has. TODO: get role-specific data
  return $("#new-orb-role").data('role');
}

// Some roles have extra tool steps. These will be done *after* the 
loopery.editor.orb_tool.orbRoleExtraSteps = {
  player: ['choose_player_goal']
}



// ============================================= Tool states
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
        loopery.Orb.Roles.enemy.drawSpikeRing(loopery.ctx, pos, {
          color: color
        });
      }

      loopery.editor.orb_tool.params.latest_loc = pos;
    },

    onleave: function() {
      loopery.editor.orb_tool.params.pos = loopery.editor.orb_tool.params.loop.getPosFromLoc(loopery.mouse.pos);

      // If the designer has selected an orb role, there might be more stuff to do...
      // TODO: this doesn't handle multiple roles
      var role = loopery.editor.orb_tool.getSelectedRole();
      if (role in loopery.editor.orb_tool.orbRoleExtraSteps) {
        loopery.editor.orb_tool.states.choose_position.next_state = loopery.editor.orb_tool.orbRoleExtraSteps[role][0];
      }

      if (this.next_state === 'choose_loop') {
        // If we're not moving on to an extra tool state, complete the orb first
        loopery.editor.orb_tool.complete(loopery.editor.orb_tool.params.loop, loopery.editor.orb_tool.params.pos);
      }
    },

    next_state: "choose_loop"
  },

  choose_player_goal: {
    onenter: function() {
      // Todo: show useful text to user
      // console.log('Next up, please choose the player goal!');
    },

    draw: function() {
      // draw orb where it was chosen to be
      var loc = loopery.editor.orb_tool.params.latest_loc;
      var color = $("#new-orb-color").val();
      draw.circle(loopery.ctx, loc, loopery.display.orb_radius, {
        fill: color,
        lineWidth: 0,
        stroke: color
      })

    },

    onleave: function() {
      var role = loopery.editor.orb_tool.getSelectedRole();
      var extras = {};

      if (role === 'player'
          && loopery.editor.clicked_tracks.length > 0
          && loopery.editor.clicked_tracks[0] !== loopery.editor.orb_tool.params.loop
      ) {
        // Set params.loop2
        extras.player_end_loop_id = loopery.editor.clicked_tracks[0].id; // or put into orb_tool.params.loop2 ?
        loopery.display.shade_hovered_circle_track = false;
        loopery.editor.orb_tool.states.choose_player_goal.next_state = "choose_loop";
      }
      else {
        // If a circle wasn't clicked, repeat this state
        loopery.editor.orb_tool.states.choose_player_goal.next_state = "choose_player_goal";
        return;
      }

      loopery.editor.orb_tool.complete(
        loopery.editor.orb_tool.params.loop,
        loopery.editor.orb_tool.params.pos,
        extras
      );
    },

    next_state: "choose_loop"
  }
}
