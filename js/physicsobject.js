/* Misc. notes:
- Methods with underscores will transform the object even if it's afixed.

*/

// All measurements less than these will be treated as 0
var negligible_distance = 0.0001; 
var negligible_rotation = 0.0001; 

function PhysicsObject(game, pos, points) { // point list should be in the object's ref frame
  obj = new GameObject(game);
  obj.pos = pos;
  configShape(obj, points);
  
  obj.transformables = [pos].concat(points);
  obj.transforms = [];
  obj.last_transform = null;
  
  // 'Afix' means to glue it to the background (i.e. it never moves)
  obj.afixed = false;
  obj.afix = function() { this.afixed = true; }
  
  // Movement
  obj.move = function(displacement) {
    if (Math.abs(displacement.r) < negligible_distance) return;
    this.transform(matrixIdentity(2), displacement);
  };
  obj._move = function(displacement) {
    if (Math.abs(displacement.r) < negligible_distance) return;
    this._transform(matrixIdentity(2), displacement);
  };
  
  obj.rotate = function(degrees, axis) {
    if (Math.abs(displacement.th) < negligible_rotation) return;
    axis = (axis == null)? xy(0, 0) : axis.copy();
    this._move(neg(axis));
    this.transform(getRotMatrix(radians(degrees)), [0, 0]);
    this._move(axis);
  };
  obj._rotate = function(degrees, axis) {
    if (Math.abs(displacement.th) < negligible_rotation) return;
    axis = (axis == null)? xy(0, 0) : axis.copy();
    this._move(neg(axis));
    this._transform(getRotMatrix(radians(degrees)), [0, 0]);
    this._move(axis);
  };
  
  obj.transform = function() {
    if (this.afixed) return;
    this.last_transform = this._transform.apply(this, arguments)
  };
  obj._transform = function() {
    // Go to the external frame of reference
    for (var i = 0; i < this.points.length; i++) this.points[i].add(this.pos);
    
    //Get transformation matrix
    var matrix = getTransformationMatrix(arguments);
    
    // Transform each point and object
    var objs = this.transformables;
    for (var i=0; i < objs.length; i++) {
      objs[i].transform(matrix);
    }
    this.transforms.push(matrix);
    
    // Go back to the object's frame of reference
    for (var i = 0; i < this.points.length; i++) this.points[i].subtract(this.pos);
    
    return matrix;
  };
  
  return obj;
}