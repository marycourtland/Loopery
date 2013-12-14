// Various useful matrix-related functions.
// Created 12/28/2012 (SpR)
//
// CONVENTIONS:
//
//  A vector is a non-empty array of number objects (i.e. typeof(obj) => 'number')
//  For instance:
//  v = [-1, 707, 2.43, Math.PI, 0]
//
//
//  A matrix is a non-empty array of row vectors, all of the same length.
//  For instance:
//  A = [ [1, 4], [2*Math.PI, 0], [5.9, 0] ]
//
//  In math notation, the above matrix would be written as:
//       _        _
//      |   1   4  |
//  A = |  2pi  0  |
//      |_ 5.9  0 _|


// Functions to check whether the argument is a well-formed vector/matrix
function isVector(v) {
  if (v.length == null) return false;
  if (v.length == 0) return false;
  for (var i = 0; i < v.length; i++) {
    if (typeof(v[i]) != 'number') return false;
  }
  return true;
}
function isMatrix(A) {
  if (A.length == null) return false;
  if (A.length == 0) return false;
  for (var i = 0; i < A.length; i++) {
    if (!isVector(A[i])) return false;
    if (A[i].length != A[0].length) return false;
  }
  return true;
  
}
function isIdentMatrix(A) {
  if (!isMatrix(A)) return false;
  for (var i = 0; i < A.length; i++) {
    if (A.length != A[i].length) return false;
    for (var j = 0; j < A[i].length; j++) {
      var element = (i == j)? 1 : 0;
      if (A[i][j] != element) return false;
    }
  }
  return true;
}

// Format the matrix nicely in a string
function matrixString(A, indent) {
  if (indent == null) indent = "";
  var s = "matrix[";
  for (var r=0; r < numRows(A); r++) {
    var row = (r != 0)? "\n       " + indent : "";
    for (var c=0; c < numCols(A); c++) row += " " + A[r][c];
    s += row;
  }
  s += " ]";
  return s;
}

// Functions to compute the number of rows/columns in a matrix
function numRows(A) {
  if (isVector(A)) return 1;
  return A.length;
}
function numCols(A) {
  if (isVector(A)) return A.length;
  return A[0].length;
}

// Functions to return a specific row or column of a matrix
function getRow(A, r) {
  return A[r];
}
function getCol(A, c) {
  var col = [];
  for (var r=0; r < numRows(A); r++) col.push(A[r][c]);
  return col
}

// Calls the callback for each (row, col) pair in a matrix.
function iterMatrix(rows, cols, callback) {
  for (var r=0; r < rows; r++) {
    for (var c=0; c < cols; c++) {
      callback(r, c)
    }
  }
}

// Return a transpose matrix
function transpose(A) {
  if (isVector(A)) A = [A];
  var m = numRows(A), n = numCols(A);
  var T = [];
  iterMatrix(m, n, function(r, c) {
    if (T.length <= c) T.push([]);
    T[c].push(A[r][c]);
  });
  return T
}

// Compute the scalar/dot product of two vectors
function scalarProduct(v1, v2) {
  if (v1.length != v2.length) throw "Error in scalarProduct: vectors aren't the same length: " + v1 + " " + v2;
  var product = 0;
  for (var i=0; i < v1.length; i++) {
    product += v1[i] * v2[i];
  }
  return product;
}

// Multiply two matrices
function matrixMultiply(A, B) {
  if (isVector(A)) A = [A];
  if (isVector(B)) B = [B];
  if (!isMatrix(A)) throw "Error in matrixMultiply: first argument isn't a matrix: " + A;
  if (!isMatrix(B)) throw "Error in matrixMultiply: second argument isn't a matrix: " + B;
  if (numCols(A) != numRows(B)) throw "Error in matrixMultiply: the arguments don't have the correct dimensions: " + A + " " + B;
  var product = matrixOnes(numRows(A), numCols(B));  
  for (var r=0; r < numRows(product); r++) {
    for (var c=0; c < numCols(product); c++) {
      product[r][c] = scalarProduct(getRow(A, r), getCol(B, c));
    }
  }
  return product;
  
  
}

// Initialize various types of matrices
function matrixZeros(rows, cols) {
  if (cols == null) cols = rows;
  var A = [];
  iterMatrix(rows, cols, function(r, c) {
    if (A.length <= r) A.push([]);
    A[r].push(0);
  });
  return A;
}
function matrixOnes(rows, cols) {
  if (cols == null) cols = rows;
  var A = [];
  iterMatrix(rows, cols, function(r, c) {
    if (A.length <= r) A.push([]);
    A[r].push(1);
  });
  return A;
}
function matrixIdentity(rows, cols) {
  if (cols == null) cols = rows;
  var A = [];
  iterMatrix(rows, cols, function(r, c) {
    if (A.length <= r) A.push([]);
    if (r == c) A[r].push(1);
    else A[r].push(0);
  });
  return A;
}


// A 2d vector with functions for affine transformations
function xyw() {
  this.x = ((arguments[1] != null)? arguments[0] : arguments[0].x);
  this.y = ((arguments[1] != null)? arguments[1] : arguments[0].y);
  this.w = ((arguments[2] != null)? arguments[2] : 1);
  this.transform = function(matrix) {
    this_vec = [[this.x], [this.y], [this.w]];
    output = matrixMultiply(matrix, this_vec);
    this.x = output[0];
    this.y = output[1];
    this.w = output[2];
  }
  this.scale = function(constant) {
    this.transform([
      [constant, 0, 0],
      [0, constant, 0],
      [0, 0, 1]
    ]);
  }
  this.rotate = function(angle) {
    this.transform([
      [Math.cos(angle), -Math.sin(angle), 0],
      [Math.sin(angle),  Math.cos(angle), 0],
      [0, 0, 1]
    ]);
   }
  this.shift = function(dx, dy) {
    this.transform([
      [1, 0, dx],
      [0, 1, dy],
      [0, 0, 1]
    ]);
  }
}

/* Turn a bunch of arguments into a matrix suitable for an affine transform.
Usages:
  getTransformationMatrix(scale_factor, rotation_radians, translation_distance)
  
  getTransformationMatrix(rotation_matrix_2x2, translation_distance)
  
  getTransformationMatrix(transformation_matrix_3x3)
    - In this case, the given matrix is simply type-checked and returned
*/
function getTransformationMatrix(args) {
  if (args.length == 1) {
    var matrix = args[0];
    if (!isMatrix(matrix)) throw "Error (getTransformationMatrix): the matrix isn't well formed: " + matrix;
    if (numRows(matrix) != 3) throw "Error (getTransformationMatrix): the matrix doesn't have 3 rows: " + matrix;
    if (numCols(matrix) != 3) throw "Error (getTransformationMatrix): the matrix doesn't have 3 columns: " + matrix;    
  }
  else if (args.length > 1) {
    if (args.length == 2) {
      var rotation = args[0];
      if (rotation == null) rotation = matrixIdentity(2);
      if (!isMatrix(rotation)) throw "Error (getTransformationMatrix): the rotation matrix isn't well formed";
      if (numRows(rotation) != 2) throw "Error (getTransformationMatrix): the rotation matrix doesn't have 2 rows";
      if (numCols(rotation) != 2) throw "Error (getTransformationMatrix): the rotation matrix doesn't have 2 columns";
      var translation = args[1];
    }
    else {
      var scale = args[0], rot = args[1];
      if (scale == null) scale = 1;
      if (rot == null) rot = 0;
      if (typeof(scale) != 'number') throw "Error (getTransformationMatrix): with 3 args, the first should be a number (the scaling factor)";
      if (typeof(rot) != 'number') throw "Error (getTransformationMatrix): with 3 args, the second should be a number (the rotation, in radians)";
      var rotation = [[scale*Math.cos(rot), -Math.sin(rot)], [Math.sin(rot), scale*Math.cos(rot)]];
      var translation = args[2];
    }
    if (isArray(translation)) {
      if (!isVector(translation)) throw "Error (getTransformationMatrix): the translation vector isn't well formed";
      if (translation.length != 2) throw "Error (getTransformationMatrix): the translation vector doesn't have length 2";
      translation = {x: translation[0], y: translation[1]};
    }
    else if (translation.x == null || translation.y == null) throw "Error (getTransformationMatrix): the translation vector isn't well formed";
    var matrix = [
      [rotation[0][0], rotation[0][1], translation.x],
      [rotation[1][0], rotation[1][1], translation.y],
      [0, 0, 1]];
  }
  else throw "Error (getTransformationMatrix): provide some arguments!";
  // Phew!
  return matrix;
}
function reverseTransformationMatrix(matrix) {
  return [
    [matrix[0][0], -matrix[0][1], -matrix[0][2]],
    [-matrix[1][0], matrix[1][1], -matrix[1][2]],
    [matrix[2][0], matrix[2][1], matrix[2][2]]
  ];
}
function getRotMatrix(radians) {
  return [
    [Math.cos(radians), -Math.sin(radians)],
    [Math.sin(radians),  Math.cos(radians)]
  ];
}


// Other useful functions
function flatten(array) {
  output = [];
  for (var i=0; i < array.length; i++) {
    if (array[i].concat != null) output = output.concat(array[i]);
    else output.push(array[i]);
  }
  return output;
}
function isArray(a) {
  return Object.prototype.toString.apply(a) === '[object Array]';
}

/* Some tests

var A = [ [1, 4], [6, 0], [5, 7] ]
console.log("A = " + matrixString(A, "    "));
console.log("\ntranspose(A) = " + matrixString(transpose(A), "               "));

dx = 3;
dy = 3;
var A = [
  [2, 0, dx], 
  [0, 2, dy],
  [0, 0, 1]
]
v1 = transpose([3, 4, 1]);
v2 = transpose([0, 5, 1]);
v3 = transpose([1, 1, 1]);

*/