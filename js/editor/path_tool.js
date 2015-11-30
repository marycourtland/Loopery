// Tool to view paths between two loop nodes
loopery.editor.path_tool = {};

loopery.editor.path_tool.level_graph = null;

loopery.editor.path_tool.params = {
  node1: null,
  node2: null
};


// Resets the tool (called when player chooses the tool)
loopery.editor.path_tool.start = function() {
  // Initialize the level graph on tool start. It won't change without the level-maker changing tools :)s

  this.level_graph = loopery.analysis.makeGraph(loopery.gameplay.getLevelData());

  this.params = {
    node1: null,
    node2: null,
    path: []
  };
  
  this.current_state = "choose_node1";
  this.current_state.loops = []; // the output path (for shading)
}

loopery.editor.path_tool.end = function() {
  loopery.editor.path_tool.level_graph = null;
  this.params = {};
  loopery.display.shade_hovered_circle_track = false;
  // todo: any other cleanup needed?
}

loopery.editor.path_tool.getNode = function(loop, dir) {
  return this.level_graph.indexed_nodes[loop.id][dir];
}

loopery.editor.path_tool.complete = function() {
  this.params.path = loopery.analysis.getShortestPathBetweenNodes(
    this.params.node1,
    this.params.node2,
    this.level_graph
  );

  if (!this.params.path) {
    this.params.path = [];
  }

}

loopery.editor.path_tool.getLoopDirFromMousePos = function(mouse_pos, loop) {
  // mouse in right half >> clockwise (dir = 1)
  // mouse in left half >> counterclockwise (dir = -1)
  // NOTE: this does not check to see if the mouse is *in* the loop.
  return mouse_pos.x > loop.loc.x ? 1 : -1;
}


// Tool states
// maybe the ui would be nicer if there was just 1 state (so you can immediately click a new cycle)
loopery.editor.path_tool.states = {
  choose_node1: {
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
      // todo: show arrows indicating which dir each semicircle represents
    },
    
    onleave: function() {
      if (loopery.editor.clicked_tracks.length > 0) {
        var loop = loopery.editor.clicked_tracks[0];
        var dir = loopery.editor.path_tool.getLoopDirFromMousePos(loopery.mouse.pos, loop);
        var node = loopery.editor.path_tool.getNode(loop, dir);
        loopery.editor.path_tool.params.node1 = node;
        this.loops = [];
        this.next_state = 'choose_node2';
      }
      else {
        // repeat this state if clicked outside a loop
        // (and reset stuff)
        // todo: maybe refactor the resetting into its own function
        this.loops = [];
        loopery.editor.path_tool.params = {
          node1: null,
          node2: null,
          path: []
        };
        this.next_state = 'choose_node1';
      }

      loopery.display.shade_hovered_circle_track = false;
    },
    next_state: "choose_node2"
  },

  choose_node2: {
    onenter: function() {
      loopery.display.shade_hovered_circle_track = true;
    },

    tick: function() {
      var pos = loopery.mouse.pos;
    },
    
    draw: function() {
      var loop1 = loopery.gameplay.levelObjects.loops[loopery.editor.path_tool.params.node1.id];
      loop1.shade('green');
      // todo: if mouse is in a loop, show both direction arrows, and shade the one which contains the mouse
    },
    
    onleave: function() {
      if (loopery.editor.clicked_tracks.length > 0) {
        var loop = loopery.editor.clicked_tracks[0];
        var dir = loopery.editor.path_tool.getLoopDirFromMousePos(loopery.mouse.pos, loop);
        var node = loopery.editor.path_tool.getNode(loop, dir);

        loopery.editor.path_tool.params.node2 = node;

        // find the path between node1 and node2
        loopery.editor.path_tool.complete();

        // earmark the involved loops to be shaded
        loopery.editor.path_tool.states.choose_node1.loops = loopery.editor.path_tool.params.path.map(function(node) {
          return loopery.gameplay.levelObjects.loops[node.id];
        })

        this.next_state = 'choose_node1';
      }
      else {
        // repeat this state if clicked outside a loop
        loopery.editor.path_tool.states.choose_node1.loops = [];
        this.next_state = 'choose_node2';
      }

      loopery.display.shade_hovered_circle_track = false;
    },
    next_state: "choose_node2"
  }
}
