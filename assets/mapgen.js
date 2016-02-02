Game.mapgen = {
  attr: {
    _mapWidth: 8,
    _mapHeight: 8,
    _roomWidth: 13,
    _roomHeight: 13,
    _startX: 2,
    _startY: 2
  },
  getMapDim: function() {
    return {x:this.attr._mapWidth,y:this.attr._mapHeight};
  },
  getRoomDim: function() {
    return {x:this.attr._roomWidth, y:this.attr._roomHeight};
  },
  generate: function() {
    var roomsGenerated = 1;
    var roomGrid = Game.util.init2DArray(this.attr._mapWidth, this.attr._mapHeight, null);
    var tilesGrid = Game.util.init2DArray(this.attr._roomWidth * this.attr._mapWidth + 50, this.attr._roomHeight * this.attr._mapHeight + 50, Game.Tile.nullTile);
    var roomStack = [];
    var coorStack = [];
    var curRoom = Game.Room.startRoom.clone();
    var curCoor = [this.attr._startX, this.attr._startY];

    for(var x = 0; x < this.attr._roomWidth * this.attr._mapWidth + 50; x++) {
      for(var y = 0; y < this.attr._roomHeight * this.attr._mapHeight + 50; y++) {
        tilesGrid[x][y] = Game.Tile.bgTiles[Math.floor(Game.Tile.bgTiles.length * ROT.RNG.getUniform())];
      }
    }

    roomStack.push(curRoom);
    coorStack.push(curCoor);
    roomGrid[curCoor[0]][curCoor[1]] = curRoom;
    curRoom.writeToGrid(tilesGrid, this.attr._roomWidth * curCoor[0], this.attr._roomHeight * curCoor[1]);

    while(roomStack.length > 0) {
      curRoom = roomStack[roomStack.length - 1];
      curCoor = coorStack[coorStack.length - 1];

      if(curRoom.getDoors().north || curRoom.getDoors().east || curRoom.getDoors().south || curRoom.getDoors().west) {
        console.log("Generating room at: " + curCoor);
        roomsGenerated++;
        if(curRoom.getDoors().north){
          curCoor = [curCoor[0], curCoor[1] - 1];
        }
        else if(curRoom.getDoors().east) {
          curCoor = [curCoor[0] + 1, curCoor[1]];
        }
        else if(curRoom.getDoors().south) {
          curCoor = [curCoor[0], curCoor[1] + 1];
        }
        else if(curRoom.getDoors().west) {
          curCoor = [curCoor[0] - 1, curCoor[1]];
        }
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
    console.log("Generated " + roomsGenerated + " rooms");
    return tilesGrid;
  }
};
