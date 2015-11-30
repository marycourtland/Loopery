loopery.analysis = loopery.analysis || {};

loopery.analysis.makeGraph = function(level) {
  // 1a. Create two nodes for each loop: one going CW (dir/winding=1), one going CCW (dir/winding=-1).
  // 1b. Also keep a loop-to-node index for easy access
  // 2. Create two directed edges for each connector
  // 3. VOILA, DIRECTED GRAPH

  var graph = {
    nodes: [],
    edges: [],
    indexed_nodes: {},
    indexed_edges: {}  // not sure if this will be useful
  }

  level.loops.forEach(function(loop) {
    var nodeA = {id:loop.id, label: loop.id + 'a', dir:1};
    var nodeB = {id:loop.id, label: loop.id + 'b', dir:-1};
    graph.nodes.push(nodeA);
    graph.nodes.push(nodeB);
    graph.indexed_nodes[loop.id] = {1: nodeA};
    graph.indexed_nodes[loop.id][-1] = nodeB;
  })

  level.connectors.forEach(function(connector) {
    var edgeU = {
      label: connector.id + 'u',
      from: graph.indexed_nodes[connector.joint1.loop][connector.joint1.winding],
      to: graph.indexed_nodes[connector.joint2.loop][-connector.joint2.winding]
    }
    var edgeV = {
      label: connector.id + 'v',
      from: graph.indexed_nodes[connector.joint2.loop][connector.joint2.winding],
      to: graph.indexed_nodes[connector.joint1.loop][-connector.joint1.winding]
    }
    graph.edges.push(edgeU);
    graph.edges.push(edgeV);
    graph.indexed_edges[connector.id] = {1: edgeU};
    graph.indexed_edges[connector.id][-1] = edgeV;
  })

  return graph;
}

loopery.analysis.getChildNodes = function(node, graph) {
  var children = [];
  graph.edges.forEach(function(edge) {
    if (edge.from === node) { children.push(edge.to); }
  })
  return children;
}

// TODO: output a format which includes edges

loopery.analysis.getShortestCycleForNode = function(node0, graph) {
  // breadth-first search => first cycle found is the shortest
  var children = loopery.analysis.getChildNodes(node0, graph);
  if (children.length === 0) { return [node0]; } // dead end

  graph.nodes.forEach(function(node) {
    node.status = {distance: null, parent: null, visited: null};
  })

  node0.status.distance = 0;
  var queue = [node0];

  while (queue.length > 0) {
    var node = queue.shift();

    var children = loopery.analysis.getChildNodes(node, graph);
    children.forEach(function(child_node) {
      if (child_node.status.distance === null) {
        child_node.status.distance = node.status.distance + 1;
        child_node.status.parent = node;
        queue.push(child_node);
      }
      else {
        // see if the node was the original node
        if (child_node === node0) {
          if (!node0.status.distance || (node.status.distance + 1 < node0.status.distance)) {
            node0.status.distance = node.status.distance + 1;
            node0.status.parent = node;
          }
        }
      }
    })
  }

  if (node0.status.parent) {
    // reconstruct cycle by following parent references
    // (this does it backwards)
    var cycle = [node0];
    var node = node0;
    while (node.status.parent !== node0) {
      node = node.status.parent;
      cycle.push(node);
    }
    return cycle;
  }
  else {
    return [node0];
  }
}

// todo: this could be merged w/ aboves
loopery.analysis.getShortestPathBetweenNodes = function(node0, node1, graph) {
  var children = loopery.analysis.getChildNodes(node0, graph);
  if (children.length === 0) { return false; } // dead end

  graph.nodes.forEach(function(node) {
    node.status = {distance: null, parent: null, visited: null};
  })

  node0.status.distance = 0;
  var queue = [node0];

  while (queue.length > 0) {
    var node = queue.shift();

    var children = loopery.analysis.getChildNodes(node, graph);
    children.forEach(function(child_node) {
      if (child_node.status.distance === null) {
        // see if node1 has been found
        if (child_node === node1) {
          if (!node1.status.distance || (node.status.distance + 1 < node1.status.distance)) {
            node1.status.distance = node.status.distance + 1;
            node1.status.parent = node;
          }
        }
        else {
          child_node.status.distance = node.status.distance + 1;
          child_node.status.parent = node;
          queue.push(child_node); 
        }
      }
    })
  }


  if (node1.status.parent) {
    // reconstruct cycle by following parent references
    // (this does it backwards)
    var path = [node1];
    var node = node1;
    while (node !== node0) {
      node = node.status.parent;
      path.push(node);
    }
    return path;
  }
  else {
    return false;
  }
}
