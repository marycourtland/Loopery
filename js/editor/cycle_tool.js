// Tool to view cycles, which helps with designing interesting and solvable levels
loopery.editor.cycle_tool = {};

loopery.editor.cycle_tool.level_graph = null;
loopery.editor.cycle_tool.level_cycles = null;

loopery.editor.cycle_tool.params = {};


// Resets the tool (called when player chooses the tool)
loopery.editor.cycle_tool.start = function() {
  // Initialize the level graph on tool start. It won't change without the level-maker changing tools :)s

  this.level_graph = loopery.analysis.makeGraph(loopery.gameplay.getLevelData());
  // this.level_cycles = loopery.analysis.getCycles(this.level_graph);
  this.params = {};
  this.current_state = "choose_root_node";
  this.current_state.loops = [];
}

loopery.editor.cycle_tool.end = function() {
  loopery.editor.cycle_tool.level_graph = null;
  loopery.editor.cycle_tool.level_cycles = null;
  this.params = {};
  loopery.display.shade_hovered_circle_track = false;
  // todo: any other cleanup needed?
}

loopery.editor.cycle_tool.getCycleContainingLoop = function(loop, dir) {
  var node = this.level_graph.indexed_nodes[loop.id][dir];
  return loopery.analysis.getShortestCycleForNode(node, this.level_graph);
}

loopery.editor.cycle_tool.getLoopDirFromMousePos = function(mouse_pos, loop) {
  // mouse in right half >> clockwise (dir = 1)
  // mouse in left half >> counterclockwise (dir = -1)
  // NOTE: this does not check to see if the mouse is *in* the loop.
  return mouse_pos.x > loop.loc.x ? 1 : -1;
}


// Tool states
// maybe the ui would be nicer if there was just 1 state (so you can immediately click a new cycle)
loopery.editor.cycle_tool.states = {
  choose_root_node: {
    loops: [], // loops to shade

    onenter: function() {
      loopery.display.shade_hovered_circle_track = true;
    },

    tick: function() {
      var pos = loopery.mouse.pos;
    },
    
    draw: function() {
      if (this.loops.length > 0) {
        this.loops.forEach(function(loop) {
          loop.shade('green');
        }) 
      }
      // todo: if mouse is in a loop, show both direction arrows, and shade the one which contains the mouse
    },
    
    onleave: function() {
      if (loopery.editor.clicked_tracks.length > 0) {
        var loop = loopery.editor.clicked_tracks[0];
        var dir = loopery.editor.cycle_tool.getLoopDirFromMousePos(loopery.mouse.pos, loop);

        // might not need to save these two 'params'
        loopery.editor.cycle_tool.params.root_node = loopery.editor.cycle_tool.level_graph.indexed_nodes[loop.id][dir];
        loopery.editor.cycle_tool.params.current_cycle = loopery.editor.cycle_tool.getCycleContainingLoop(loop, dir);

        this.loops = loopery.editor.cycle_tool.params.current_cycle.map(function(node) {
          return loopery.gameplay.levelObjects.loops[node.id];
        })
      }
      else {
        // repeat this state if clicked outside a loop
        loopery.editor.cycle_tool.params.root_node = null;
        loopery.editor.cycle_tool.params.current_cycle = null;
        this.loops = [];
      }

      loopery.display.shade_hovered_circle_track = false;
    },
    next_state: "choose_root_node"
  }
}
