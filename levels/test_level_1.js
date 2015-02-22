 // (9)16 -13- 17(10) 22
 //               18    \
 //               |       \
 //               14       23
 //               |           \
 //               19           24
 //              (11)20 -15- 21(12)


var test_level = {
  "info": {
    "name": "Test Level"
  },
  "loops":[  
    {  
      "id":9,
      "x":120,
      "y":280,
      "r":120
    },
    {  
      "id":10,
      "x":400,
      "y":200,
      "r":40
    },
    {  
      "id":11,
      "x":400,
      "y":380,
      "r":40
    },
    {  
      "id":12,
      "x":750,
      "y":420,
      "r":80
    }
  ],
  "connectors":[
    {  
      "id":13,
      "joint1":16,
      "joint2":17
    },
    {  
      "id":14,
      "joint1":18,
      "joint2":19
    },
    {  
      "id":15,
      "joint1":20,
      "joint2":21
    },
    {  
      "id":23,
      "joint1":22,
      "joint2":24
    }
  ],
  "joints":[
    {
      "id":16,
      "loop":9,
      "connector":13,
      "winding":1,
      "state": false
    },
    {
      "id":17,
      "loop":10,
      "connector":13,
      "winding":-1,
      "state": false
    },
    {
      "id":18,
      "loop":10,
      "connector":14,
      "winding":1,
      "state": false
    },
    {
      "id":19,
      "loop":11,
      "connector":14,
      "winding":-1,
      "state": false
    },
    {
      "id":20,
      "loop":11,
      "connector":15,
      "winding":1,
      "state": false
    },
    {
      "id":21,
      "loop":12,
      "connector":15,
      "winding":-1,
      "state": false
    },
    {
      "id":22,
      "loop":10,
      "connector":23,
      "winding":-1,
      "state": false
    },
    {
      "id":24,
      "loop":12,
      "connector":23,
      "winding":1,
      "state": false
    }
  ],
  "orbs":[
    {
      "id":22,
      "color":"blue",
      "start":9,
      "start_dir":1,
      "end":12
    },
    {
      "id":25,
      "color":"red",
      "start":12,
      "start_dir":-1,
      "end":12
    }
  ],
  "enemies":[
    {
      "id":26,
      "start":11,
      "start_dir":1
    }  
  ],
  "decorations":[
  ]
}
