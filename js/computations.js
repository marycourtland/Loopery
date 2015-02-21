loopery.getTangent = function(loop1, loop2, wind1, wind2) {
  // Inner tangents only, for now (wind1 === wind1)

  var p1 = loop1.loc,
      p2 = loop2.loc,
      rad1 = loop1.radius,
      rad2 = loop2.radius;

  // dd = vector from loop1 to loop2
  var dd = subtract(p2, p1);


  var  getInnerTangent = function() {
    console.debug('Inner tangent');
    // get length of tangent vector
    var tangent_r = Math.sqrt(dd.r*dd.r - (rad1 + rad2) * (rad1 + rad2));

    // get angle between dd and tangent vector
    var theta = (wind1 === 1) ? dd.th - Math.asin(tangent_r / dd.r) : dd.th + Math.asin(tangent_r / dd.r)

    // get vector from center of loop1 to origin of tangent vector
    var loop1_to_tangent_origin = rth(rad1, theta);
    console.debug("loop1_to_tangent_origin: " + loop1_to_tangent_origin);

    // get origin of tangent vector (absolute)
    var tangent_origin = add(p1, loop1_to_tangent_origin);

    // get tangent vector angle
    var tangent_th = (wind1 === 1) ? theta + Math.PI/2 : theta - Math.PI/2

    // construct tangent vector
    var tangent = rth(tangent_r, tangent_th);

    console.debug('Returning tangent_origin:', tangent_origin);

    return {origin: tangent_origin, vector:tangent};
  }

  var  getOuterTangent = function() {
    console.debug('Outer tangent');
    // get angle between dd and tangent vector (90 degrees with offset that depends on difference of radii)
    var theta_offset = Math.asin(-(rad1 - rad2)/dd.r);
    var theta = (wind1 === 1) ? dd.th - (Math.PI/2 + theta_offset) :  dd.th + (Math.PI/2 + theta_offset);

    // get vector from center of loop1 to origin of tangent vector
    var loop1_to_tangent_origin = rth(rad1, theta);

    // get vector from center of loop2 to origin of tangent vector
    var loop1_to_tangent_origin = rth(rad1, theta);

    // get origin of tangent vector (absolute)
    var tangent_origin = add(p1, loop1_to_tangent_origin);

    // get length of tangent vector
    var tangent_r = Math.sqrt(dd.r*dd.r - (rad1 - rad2) * (rad1 - rad2));

    // get tangent vector angle
    var tangent_th = (wind1 === 1) ? theta + Math.PI/2 : theta - Math.PI/2

    // construct tangent vector
    var tangent = rth(tangent_r, tangent_th);

    return {origin: tangent_origin, vector:tangent};

  }

  return (wind1 === wind2) ? getInnerTangent() : getOuterTangent();
}