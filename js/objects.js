loopery.objectTypes = [
  {group: 'loops',       type: 'Loop',       renderOrder: 1,  clickPriority: 2, parent: null},
  {group: 'joints',      type: 'Joint',      renderOrder: 2,  clickPriority: 3, parent: 'connectors'},
  {group: 'connectors',  type: 'Connector',  renderOrder: 0,  clickPriority: 1, parent: null},
  {group: 'orbs',        type: 'Orb',        renderOrder: 3,  clickPriority: 4, parent: null},
  {group: 'decorations', type: 'Decoration', renderOrder: 4,  clickPriority: -1, parent: null}
];

loopery.objectTypes.sortBy = function(property, opposite) {
  //make deepcopy to preserve original ordering
  var sorted = [];
  this.forEach(function(object) {
    sorted.push(object);
  })
  var ordering = opposite ? -1 : 1;
  sorted.sort(function(obj1, obj2) {
    return (obj1[property] > obj2[property]) * ordering;
  })
  return sorted;

}

