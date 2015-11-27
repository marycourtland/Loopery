// A nice intro animation

loopery.presentation = {};
loopery.presentation.running = false;
loopery.presentation.speed = loopery.orb_speed * 3;


loopery.presentation.canvas = $("#presentation_canvas")[0];
loopery.presentation.canvas.style.backgroundColor = 'transparent';
loopery.presentation.canvas.width = loopery.size.x;
loopery.presentation.canvas.height = loopery.size.y;
loopery.presentation.ctx = loopery.presentation.canvas.getContext('2d');

loopery.presentation.tips = [];
// tip object: {track:trackobj, pos:position, dir:dir}

loopery.presentation.start = function(initial_tips, endCallback) {
  this.tips = initial_tips;
  this.running = true;
  this.endCallback = endCallback || function() {};

  // reset presentation status of each track
  var loops = loopery.gameplay.lookup({group:'loops'});
  var connectors = loopery.gameplay.lookup({group:'connectors'});
  for (var id in loops) { loops[id].presented = false; }
  for (var id in connectors) { connectors[id].presented = false; }

  clear(loopery.presentation.ctx);
  $(loopery.presentation.canvas).show();
  $(loopery.canvas_bg).hide();
  $(loopery.canvas).hide();
}

loopery.presentation.stop = function() {
  this.running = false;
  $(loopery.canvas_bg).fadeIn(500);
  $(loopery.canvas).show();
  $(loopery.presentation.canvas).fadeOut(500);
  if (this.endCallback) { this.endCallback(); }
}

loopery.presentation.tick = function() {
  var new_tips = [];

  this.tips.forEach(function(tip) {
    if (!tip.done) {
      loopery.presentation.advanceTip(tip);

      loopery.presentation.getNewTips(tip).forEach(function(tip) {
        new_tips.push(tip);
      });

      if (loopery.presentation.isTipDone(tip)) {
        tip.done = true;
        tip.track.presented = true;

        var dpos = 0.02;
        tip.pos -= dpos;
        if (tip.track.group === 'connectors' && tip.dir == -1) {
          tip.pos += 2*dpos;
        }
      }
    }
  });

  new_tips.forEach(function(tip) {
    loopery.presentation.tips.push(tip);
  });

  if (this.tips.filter(function(tip) { return !tip.done; }).length === 0) {
    this.stop();
  }
}

loopery.presentation.draw = function() {
  clear(loopery.presentation.ctx);
  this.tips.forEach(loopery.presentation.drawTip);
}

loopery.presentation.advanceTip = function(tip) {
  tip.oldpos = tip.pos;
  tip.pos = tip.track.getNextPos(tip.pos, tip.dir, loopery.presentation.speed);
}

loopery.presentation.getNewTips = function(tip) {
  // this could be refactored with parts of joint.attemptTransfer (pretend tips are orbs)
  var new_tips = [];

  if (tip.track.group === 'loops') {
    var jointsToCheck = loopery.gameplay.lookup({group:'joints', loop_id:tip.track.id});
    jointsToCheck.forEach(function(joint) {
      if (isBetweenOnCircle(joint.pos, tip.oldpos, tip.pos, 1) && !joint.connector.presented) {
        // okay, make a new tip on the joint's connector
        var joint_index = (joint.connector.joints[0].id === joint.id) ? 0 : 1;
        var dir = (joint_index === 0) ? 1: -1;
        new_tips.push({
          track: joint.connector,
          initialpos: joint_index,
          pos: joint_index + dir*0.001,
          oldpos: joint_index + dir*0.001,
          dir: dir,
          done: false
        });
      }
    });
  }
  else if (tip.track.group === 'connectors') {
    var joint = (tip.pos < 0) ? tip.track.joints[0] : (tip.pos > 1) ? tip.track.joints[1] : null;

    if (joint && !joint.loop.presented) {
      // okay, make a new tip on the joint's loop
      new_tips.push({
        track: joint.loop,
        initialpos: joint.pos,
        pos: joint.pos + -joint.winding*0.001,
        oldpos: joint.pos + -joint.winding*0.001,
        dir: -joint.winding,
        done: false
      });
    }
  }

  return new_tips;
}

loopery.presentation.isTipDone = function(tip) {
  if (tip.track.group === 'loops') {
    return isBetweenOnCircle(tip.initialpos, tip.oldpos, tip.pos, 1);
  }
  else if (tip.track.group === 'connectors') {
    return tip.pos > 1 || tip.pos < 0;
  }
  return false;
}

loopery.presentation.drawTip = function(tip) {
  var params = {
    stroke: loopery.display.track_color,
    fill: 'transparent',
    lineWidth: loopery.display.track_width,
    // lineCap: tip.done && tip.track.group === 'loops' ? 'square' : 'round'
    lineCap: 'round'
  };

  if (tip.track.group === 'loops') {
    if (tip.done) {
      draw.circle(loopery.presentation.ctx, tip.track.loc, tip.track.radius, params);
    }
    else {
      var p0 = tip.initialpos*2*Math.PI;
      var p1 = tip.pos*2*Math.PI;
      if (tip.dir ===-1) {
        _p1 = p1;
        p1 = p0;
        p0 = _p1;
      }
      draw.arc(loopery.presentation.ctx, tip.track.loc, tip.track.radius, p0, p1, params);
    }
  }
  else if (tip.track.group === 'connectors') {
    draw.line(loopery.presentation.ctx, tip.track.getPosCoords(tip.initialpos), tip.track.getPosCoords(tip.pos), params);
  }
}

