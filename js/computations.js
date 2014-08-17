// Utility methods - to find position of linear tracks tangent to two circular tracks
// WARNING: MESSY CODE (but it works)
loopery.getOuterTangents = function(track1, track2, echo) {
  if (track2.radius === track1.radius) {
    var dd = subtract(track1.loc, track2.loc);
    return [
      [(dd.th + Math.PI/2)/(2 * Math.PI), (dd.th + Math.PI/2)/(2 * Math.PI)],
      [(dd.th - Math.PI/2)/(2 * Math.PI), (dd.th - Math.PI/2)/(2 * Math.PI)]
    ]
  }
  
  // circle1 should be the smaller one, and circle2 should be the larger one
  if (track2.radius > track1.radius) {
    p1 = track1.pos
    p2 = track2.pos
    rad1 = track1.radius
    rad2 = track2.radius
  }
  else {
    p1 = track2.pos
    p2 = track1.pos
    rad1 = track2.radius
    rad2 = track1.radius
  }
  var dd = subtract(p2, p1);
  var r21 = rad2 - rad1;
  var l = Math.sqrt(dd.r*dd.r - r21*r21);
  var lth1 = dd.th - Math.acos(l/dd.r);
  var lth2 = dd.th + Math.acos(l/dd.r);
  var ll1 = rth(l, lth1);
  var ll2 = rth(l, lth2);
  var rr1 = subtract(ll1, dd);
  var rr2 = subtract(ll2, dd);
  var dr1 = rth(rad1, rr1.th);
  var dr2 = rth(rad1, rr2.th);
  
  // This returns the circular positions
  // NB: the order in which they are returned should depend on the order in
  // which they were passed into the method, not on their track size. But
  // dr1, dr2 etc are defined based on size. So that's why this if statement
  // is needed. 
  // (The two return arrays in each case are the same, except for swapped elements)
  if (track2.radius > track1.radius) {
    return [
      [dr1.th / (2*Math.PI), add(rr1, dr1).th / (2*Math.PI)],
      [dr2.th / (2*Math.PI), add(rr2, dr2).th / (2*Math.PI)],
    ]
  }
  else {
    return [
      [dr2.th / (2*Math.PI), add(rr2, dr2).th / (2*Math.PI)],
      [dr1.th / (2*Math.PI), add(rr1, dr1).th / (2*Math.PI)],
    ]
  }
    
  // This returns the actual coordinate positions of the track endpoints
  //return [
  //  [add(p1, dr1), add(add(p2, rr1), dr1)],
  //  [add(p1, dr2), add(add(p2, rr2), dr2)],
  //]
}

// This only works if track1's radius is greater or equal to track2's radius
// TODO: fix that
loopery.getInnerTangents = function(track1, track2, echo) {
  /*if (track2.radius === track1.radius) {
    var dd = subtract(p2, p1);
    return [
      [dd.th + Math.PI/4, dd.th + Math.PI/4],
      [dd.th - Math.PI/4, dd.th - Math.PI/4]
    ]
  }*/
  
  // circle1 should be the larger one, and circle2 should be the smaller one
  if (track1.radius >= track2.radius) {
    p1 = track1.pos
    p2 = track2.pos
    rad1 = track1.radius
    rad2 = track2.radius
  }
  else {
    p1 = track2.pos
    p2 = track1.pos
    rad1 = track2.radius
    rad2 = track1.radius
  }
  var dd = subtract(p2, p1);
  var r21 = rad2 + rad1;
  if (dd.r < r21) return [[null, null], [null, null]]; // circles are overlapping
  
  var l = Math.sqrt(dd.r*dd.r - r21*r21);
  var lth1 = dd.th - Math.acos(l/dd.r);
  var lth2 = dd.th + Math.acos(l/dd.r);
  var ll1 = rth(l, lth1);
  var ll2 = rth(l, lth2);
  var rr1 = subtract(ll1, dd);
  var rr2 = subtract(ll2, dd);
  
  // This returns the circular positions
  // NB: the order in which they are returned should depend on the order in
  // which they were passed into the method, not on their track size. But
  // dr1, dr2 etc are defined based on size. So that's why this if statement
  // is needed. 
  // (The two return arrays in each case are the same, except for swapped elements)
  
  // NOTE:
  // Here, we use >. However at the beginning of the method we use >=
  // This is not an accident. For some reason, it works when it's this way
  // TODO: find out why
  if (true || track2.radius > track1.radius) {
    return [
      //[rr1.th / (2*Math.PI), (rr1.th + Math.PI/2) / (2*Math.PI)],
      //[rr2.th / (2*Math.PI), (rr2.th + Math.PI/2) / (2*Math.PI)],
      [mod((rr1.th + Math.PI) / (2*Math.PI), 1), mod(rr1.th / (2*Math.PI), 1)],
      [mod((rr2.th + Math.PI) / (2*Math.PI), 1), mod(rr2.th / (2*Math.PI), 1)],
    ]
  }
  else {
    return [
      [mod((rr2.th + Math.PI) / (2*Math.PI), 1), mod(rr2.th / (2*Math.PI), 1)],
      [mod((rr1.th + Math.PI) / (2*Math.PI), 1), mod(rr1.th / (2*Math.PI), 1)],
    ]
  }

}