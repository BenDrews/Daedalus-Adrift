Game.mapgen = {
  attr: {
    _mapWidth: 13,
    _mapHeight: 13
  },
  generate: function() {
    try{
    var roomGrid = Game.util.init2DArray(this.attr._mapWidth, this.attr._mapHeight, null);
    var tilesGrid = Game.util.init2DArray(13 * this.attr._mapWidth, 13 * this.attr._mapHeight, Game.Tile.nullTile);
    var roomStack = [];
    var coorStack = [];
    var curRoom = null;
    var curCoor = null;
    roomStack.push(Game.Room.startRoom.clone());
    console.dir(Game.Room.startRoom.clone());
    coorStack.push([6,6]);
    roomGrid[6][6] = roomStack[0];
    roomStack[0].writeToGrid(tilesGrid, 13 * coorStack[0][0], 13 * coorStack[0][1]);
    while(roomStack.length > 0) {
      new Game.Map(tilesGrid).renderOn(Game.DISPLAYS.main.o, 84, 70);
      console.log("Loop iter");
      curRoom = roomStack[roomStack.length - 1];
      curCoor = coorStack[coorStack.length - 1];
      //Take care of north door
      if(curRoom.getDoors().north){
        console.log('test spot');
        curCoor = [curCoor[0], curCoor[1] - 1];
        do {
          console.log("north loop");
          curRoom = Game.Room.palette[Math.floor(Game.Room.palette.length * ROT.RNG.getUniform())].clone();
          console.log('' + curRoom.checkGrid(roomGrid, curCoor[0], curCoor[1]));
        } while(!(curRoom.checkGrid(roomGrid, curCoor[0], curCoor[1])));
        curRoom.closeAdjDoors(roomGrid, curCoor[0], curCoor[1]);
        roomGrid[curCoor[0]][curCoor[1]] = curRoom;
        roomStack.push(curRoom);
        coorStack.push(curCoor);
        curRoom.writeToGrid(tilesGrid, 13 * curCoor[0], 13 * curCoor[1]);
      }
      //Take care of east door
      else if(curRoom.getDoors().east){
        curCoor = [curCoor[0] + 1, curCoor[1]];
        do {
          console.log('east loop');
          curRoom = Game.Room.palette[Math.floor(Game.Room.palette.length * ROT.RNG.getUniform())].clone();
          console.log('' + curRoom.checkGrid(roomGrid, curCoor[0], curCoor[1]));
        } while(!(curRoom.checkGrid(roomGrid, curCoor[0], curCoor[1])));
        curRoom.closeAdjDoors(roomGrid, curCoor[0], curCoor[1]);
        roomGrid[curCoor[0]][curCoor[1]] = curRoom;
        roomStack.push(curRoom);
        coorStack.push(curCoor);
        curRoom.writeToGrid(tilesGrid, 13 * curCoor[0], 13 * curCoor[1]);
      }
      //Take care of south door
      else if(curRoom.getDoors().south){
        curCoor = [curCoor[0], curCoor[1] + 1];
        do {
          console.log('south loop');
          curRoom = Game.Room.palette[Math.floor(Game.Room.palette.length * ROT.RNG.getUniform())].clone();
          console.log('' + curRoom.checkGrid(roomGrid, curCoor[0], curCoor[1]));
        } while(!(curRoom.checkGrid(roomGrid, curCoor[0], curCoor[1])));
        curRoom.closeAdjDoors(roomGrid, curCoor[0], curCoor[1]);
        roomGrid[curCoor[0]][curCoor[1]] = curRoom;
        roomStack.push(curRoom);
        coorStack.push(curCoor);
        curRoom.writeToGrid(tilesGrid, 13 * curCoor[0], 13 * curCoor[1]);
      }
      //Take care of west door
      else if(curRoom.getDoors().west){
        curCoor = [curCoor[0] - 1, curCoor[1]];
        do {
          console.log('west loop');
          curRoom = Game.Room.palette[Math.floor(Game.Room.palette.length * ROT.RNG.getUniform())].clone();
          console.log('' + curRoom.checkGrid(roomGrid, curCoor[0], curCoor[1]));
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
    console.log("Done generating");
    return tilesGrid;
  }
  catch(err) {
    console.log("ERROR: " + err);
    return tilesGrid;
  }
  }
};
