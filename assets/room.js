Game.Room = function (doors, floorPlan, randObstacles) {
  this.attr = {
    _doors: doors,
    _floorPlan: floorPlan,
    _randObstacles: randObstacles
  };
};

Game.Room.prototype.closeDoor = function (direction) {
  this.attr._doors[direction] = false;
};

Game.Room.prototype.closeRoom = function () {
  this.attr._doors = false;
};

Game.Room.prototype.clone = function () {
  return new Game.Room(this.attr._doors, this.attr._floorPlan, this.attr._randObstacles);
};

Game.Room.prototype.draw = function (display, x, y) {
  display.draw
};
//-----------------------------------------------------------------------------
