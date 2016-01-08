Game.mapgen = {
  attr: {
    _mapWidth: 169,
    _mapHeight: 169
  },
  generate: function() {
    var tilesGrid = Game.util.init2DArray(this.attr._mapWidth, this.attr._mapHeight, Game.Tile.nullTile);
    var roomStack = [];
    var coorStack = [];
    var curRoom = null;
    var curCoor = null;
    roomStack.push(Game.Room.startRoom.clone());
    console.dir(Game.Room.startRoom.clone());
    coorStack.push([78,78]);
    roomStack[0].writeToGrid(tilesGrid, coorStack[0][0], coorStack[0][1]);
    while(roomStack.length > 0) {
      curRoom = roomStack[roomStack.length - 1];
      curCoor = coorStack[coorStack.length - 1];
      //Take care of north door
      if(curRoom.getDoors().north){
        curRoom.closeDoor('north');
        curCoor = [curCoor[0] - 13, curCoor[1]];
        do {
          curRoom = Game.Room.palette[Math.floor(Game.Room.palette.length * ROT.RNG.getUniform())].clone();
        } while(curCoor[0] - 13 < 0 && curRoom.getDoors().north);
        roomStack.push(curRoom);
        coorStack.push(curCoor);
        curRoom.writeToGrid(tilesGrid, curCoor[0], curCoor[1]);
      }
      //Take care of east door
      else if(curRoom.getDoors().east){
        curRoom.closeDoor('east');
        curCoor = [curCoor[0], curCoor[1] + 13];
        do {
          curRoom = Game.Room.palette[Math.floor(Game.Room.palette.length * ROT.RNG.getUniform())].clone();
        } while(curCoor[1] + 13 >= 169 && curRoom.getDoors().east);
        roomStack.push(curRoom);
        coorStack.push(curCoor);
        curRoom.writeToGrid(tilesGrid, curCoor[0], curCoor[1]);
      }
      //Take care of south door
      else if(curRoom.getDoors().south){
        curRoom.closeDoor('south');
        curCoor = [curCoor[0] + 13, curCoor[1]];
        do {
          curRoom = Game.Room.palette[Math.floor(Game.Room.palette.length * ROT.RNG.getUniform())].clone();
        } while(curCoor[0] + 13 >= 169 && curRoom.getDoors().north);
        roomStack.push(curRoom);
        coorStack.push(curCoor);
        curRoom.writeToGrid(tilesGrid, curCoor[0], curCoor[1]);
      }
      //Take care of west door
      else if(curRoom.getDoors().west){
        curRoom.closeDoor('west');
        curCoor = [curCoor[0], curCoor[1] - 13];
        do {
          curRoom = Game.Room.palette[Math.floor(Game.Room.palette.length * ROT.RNG.getUniform())].clone();
        } while(curCoor[1] - 13 < 0 && curRoom.getDoors().west);
        roomStack.push(curRoom);
        coorStack.push(curCoor);
        curRoom.writeToGrid(tilesGrid, curCoor[0], curCoor[1]);
      } else {
        curRoom.closeRoom();
        roomStack.pop();
        coorStack.pop();
      }
    }
    return tilesGrid;
  }
};
