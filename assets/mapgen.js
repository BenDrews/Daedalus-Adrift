Game.mapgen = {
  attr: {
    _mapWidth: 13,
    _mapHeight: 13
  },
  generate: function() {
    var roomGrid = Game.util.init2DArray(this.attr._mapWidth, this.attr._mapHeight, null);
    var tilesGrid = Game.util.init2DArray(13 * this.attr._mapWidth, 13 * this.attr._mapHeight, Game.Tile.nullTile);
    var roomStack = [];
    var coorStack = [];
    var curRoom = Game.Room.startRoom.clone();
    var curCoor = null;

    roomStack.push(curRoom);
    coorStack.push([6,6]);
    roomGrid[6][6] = curRoom;
    curRoom.writeToGrid(tilesGrid, 13 * coorStack[0][0], 13 * coorStack[0][1]);

    while(roomStack.length > 0) {
      curRoom = roomStack[roomStack.length - 1];
      curCoor = coorStack[coorStack.length - 1];
      //Take care of north door
      if(curRoom.hasOpenDoor()) {
        if(curRoom.getDoors().north){
          curCoor = [curCoor[0], curCoor[1] - 1];
        }
        //Take care of east door
        else if(curRoom.getDoors().east) {
          curCoor = [curCoor[0] + 1, curCoor[1]];
        }
        //Take care of south door
        else if(curRoom.getDoors().south) {
          curCoor = [curCoor[0], curCoor[1] + 1];
        }
        //Take care of west door
        else if(curRoom.getDoors().west) {
          curCoor = [curCoor[0] - 1, curCoor[1]];
        }
        console.log("Generating room at " + curCoor);
        do {
          curRoom = Game.Room.palette[Math.floor(Game.Room.palette.length * ROT.RNG.getUniform())].clone();
        } while(!(curRoom.checkGrid(roomGrid, curCoor[0], curCoor[1])));
        curRoom.closeAdjDoors(roomGrid, curCoor[0], curCoor[1]);
        roomGrid[curCoor[0]][curCoor[1]] = curRoom;
        roomStack.push(curRoom);
        coorStack.push(curCoor);
        curRoom.writeToGrid(tilesGrid, 13 * curCoor[0], 13 * curCoor[1]);
    } else {
        roomStack.pop();
        coorStack.pop();
      }
    }
    console.log("Map generated");
    return tilesGrid;
  }
};
