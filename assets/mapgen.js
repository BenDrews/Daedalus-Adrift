Game.mapgen = {
  attr: {
    _mapWidth: 169,
    _mapHeight: 169
  },
  //Write the python script
  _startRoom: new Game.Room({north: true, east: true, south: true, west: true},
    [
    '######+######',
    '#           #',
    '#           #',
    '#           #',
    '#           #',
    '#           #',
    '+           +',
    '#           #',
    '#           #',
    '#           #',
    '#           #',
    '#           #',
    '######+######'
    ],
    false),
  _roomPalette: [
    new Game.Room({north: true, east: false, south: true, west:false},
    [

    ],
    false}),

  ],
  generate: function() {
    var roomStack = [];

  }
};
