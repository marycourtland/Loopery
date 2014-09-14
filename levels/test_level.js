 // (9)16 -13- 17(10)
 //               18
 //               |
 //               14
 //               |
 //               19
 //              (11)20 -15- 21(12)


var test_level = {
  "loops":[  
    {  
      "id":9,
      "x":50,
      "y":200,
      "r":40
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
      "y":380,
      "r":40
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
    }
  ],
  "joints":[
    {
      "id":16,
      "loop":9,
      "connector":13,
      "winding":1
    },
    {
      "id":17,
      "loop":10,
      "connector":13,
      "winding":-1
    },
    {
      "id":18,
      "loop":10,
      "connector":14,
      "winding":1
    },
    {
      "id":19,
      "loop":11,
      "connector":14,
      "winding":-1
    },
    {
      "id":20,
      "loop":11,
      "connector":15,
      "winding":1
    },
    {
      "id":21,
      "loop":12,
      "connector":15,
      "winding":-1
    }
  ],
  "orbs":[
    {
      "id":22,
      "color":"blue",
      "start":9,
      "start_dir":1,
      "end":12
    }
  ],
  "decorations":[
  ]
}
