Game.MapTileSets = {
  spaceship1: {
    _width: 169,
    _height: 169,
    getMapTiles: function () {
      return Game.mapgen.generate();
    }
  }
};
