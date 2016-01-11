Game.Tile = function (properties) {
  properties = properties || {};
  Game.Symbol.call(this, properties);
  if (! ('attr' in this)) { this.attr = {}; }
  this.attr._name = properties.name || 'unknown';
  this.attr._walkable = properties.walkable||false;
  this.attr._diggable = properties.diggable||false;
};
Game.Tile.extend(Game.Symbol);

Game.Tile.prototype.clone = function () {
  clonedTile = new Game.Tile();
  for (var property in this.attr) {
    if (this.attr.hasOwnProperty(property)) {
      clonedTile.attr[property] = this.attr[property];
    }
  }
  return clonedTile;
};

Game.Tile.prototype.getName = function () {
  return this.attr._name;
};
Game.Tile.prototype.isWalkable = function () {
  return this.attr._walkable;
};
Game.Tile.prototype.isDiggable = function () {
  return this.attr._diggable;
};
//-----------------------------------------------------------------------------


Game.Tile.nullTile = new Game.Tile({name: 'nullTile', chr: 'z'});
Game.Tile.floorTile = new Game.Tile({name: 'floor', chr: 'a', walkable: true});
Game.Tile.blackFloorTile = new Game.Tile({name: 'blackFloor', chr: 'b', walkable: true});
Game.Tile.blueFloorTile = new Game.Tile({name: 'blueFloor', chr: 'c', walkable: true});
Game.Tile.greenFloorTile = new Game.Tile({name: 'greenFloor', chr: 'd', walkable: true});
Game.Tile.wallTile = new Game.Tile({name:'wall', chr:'#'});

Game.Tile.blackWallHoriTile = new Game.Tile({name:'blackWallHori', chr:'e'});
Game.Tile.blackWallVertiTile = new Game.Tile({name:'blackWallVerti', chr:'f'});
Game.Tile.blackCorner1Tile = new Game.Tile({name:'blackCorner1', chr:'g'});
Game.Tile.blackCorner2Tile = new Game.Tile({name:'blackCorner2', chr:'h'});
Game.Tile.blackCorner3Tile = new Game.Tile({name:'blackCorner3', chr:'i'});
Game.Tile.blackCorner4Tile = new Game.Tile({name:'blackCorner4', chr:'j'});
Game.Tile.blackDoorTile = new Game.Tile({name:'blackDoor', chr:'k', walkable: true});


Game.Tile.blueWallHoriTile = new Game.Tile({name:'blueWallHori', chr:'l'});
Game.Tile.blueWallVertiTile = new Game.Tile({name:'blueWallVerti', chr:'m'});
Game.Tile.blueCorner1Tile = new Game.Tile({name:'blueCorner1', chr:'n'});
Game.Tile.blueCorner2Tile = new Game.Tile({name:'blueCorner2', chr:'o'});
Game.Tile.blueCorner3Tile = new Game.Tile({name:'blueCorner3', chr:'p'});
Game.Tile.blueCorner4Tile = new Game.Tile({name: 'blueCorner4', chr: 'q'});
Game.Tile.blueDoorTile = new Game.Tile({name:'blueDoor', chr:'r', walkable: true});

Game.Tile.greenWallHoriTile = new Game.Tile({name:'greenWallHori', chr:'s'});
Game.Tile.greenWallVertiTile = new Game.Tile({name:'greenWallVerti', chr:'t'});
Game.Tile.greenCorner1Tile = new Game.Tile({name:'greenCorner1', chr:'u'});
Game.Tile.greenCorner2Tile = new Game.Tile({name:'greenCorner2', chr:'v'});
Game.Tile.greenCorner3Tile = new Game.Tile({name:'greenCorner3', chr:'w'});
Game.Tile.greenCorner4Tile = new Game.Tile({name: 'greenCorner4', chr: 'x'});
Game.Tile.greenDoorTile = new Game.Tile({name:'greenDoor', chr:'y', walkable: true});
