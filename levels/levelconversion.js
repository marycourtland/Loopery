// Run this in the old Ludum Dare version to extract relevant level data and put it in the new format
function getLevelData() {
  var data = {};
  data.info = {name: "Sample level " + game.current_level.id };
  data.loops = [];
  data.connectors = [];
  data.joints = [];
  data.orbs = [{id:0, color: 'blue', start: 1, start_dir: 1, end: 100}];
  data.decorations = [];

  // LOOPS
  game.tracks.forEach(function(t) {
    if (t.type !== 'circular' || t.level.id !== game.current_level) {
      return;
    }

    data.loops.push({
      id: t.id,
      x: t.pos.x,
      y: t.pos.y,
      r: t.radius
    });

    if (t.is_start) { data.orbs[0].start = t.id; }
    if (t.is_end) { data.orbs[0].end = t.id; }

    // Color it orange so it's obvious that it's been converted
    t.color = 'orange';
  })



  // CONNECTORS AND JOINTS
  game.tracks.forEach(function(t) {
    if (t.type !== 'linear' || t.level.id !== game.current_level) {
      return;
    }

    // Create the two joints
    // (need to create unique ids - so just add 10000 and 20000 to the
    // connector track id, this will be fine)

    var joint1 = {
      id: t.id + 10000,
      loop: t.track1.id,
      connector: t.id,
      winding: t.parent_track_winding[t.track1.id],
      state: t.track1.connections[t.id]
    };
    var joint2 = {
      id: t.id + 20000,
      loop: t.track2.id,
      connector: t.id,
      winding: t.parent_track_winding[t.track2.id],
      state: t.track2.connections[t.id]
    };

    data.joints.push(joint1);
    data.joints.push(joint2);


    // Then create the connectors
    data.connectors.push({
      id: t.id,
      joint1: joint1.id,
      joint2: joint2.id
    })


    // Color it blue so it's obvious that it's been converted
    t.color = 'blue';
  })

  // For the decorations, sorry, you'll have to do this yourself. :)

  return data;
}
