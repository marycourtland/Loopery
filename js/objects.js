loopery.objectTypes = [
  {group: 'loops',       type: 'Loop',       ctx: 'ctx_bg', renderOrder: 1,  clickPriority: 2, parent: null},
  {group: 'joints',      type: 'Joint',      ctx: 'ctx',    renderOrder: 2,  clickPriority: 3, parent: 'connectors'},
  {group: 'connectors',  type: 'Connector',  ctx: 'ctx_bg', renderOrder: 0,  clickPriority: 1, parent: null},
  {group: 'orbs',        type: 'Orb',        ctx: 'ctx',    renderOrder: 3,  clickPriority: 4, parent: null},
  {group: 'decorations', type: 'Decoration', ctx: 'ctx_bg', renderOrder: 4,  clickPriority: -1, parent: null}
];


loopery.objectTypes.sortBy = function(property, opposite) {
  //make deepcopy to preserve original ordering
  var sorted = [];
  this.forEach(function(object) {
    sorted.push(object);
  })
  sorted.sort(function(obj1, obj2) {
    return (obj1[property] - obj2[property]);
  })
  if (opposite) {
    sorted.reverse();
  }
  return sorted;
}

// index object types by group
loopery.objectTypesByGroup = {};
loopery.objectTypes.forEach(function(obj_type_data) {
  loopery.objectTypesByGroup[obj_type_data.group] = obj_type_data;
});
