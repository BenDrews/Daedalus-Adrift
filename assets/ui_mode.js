Game.UIMode = {};

Game.UIMode.gameStart = {
  enter: function () {
    console.log("Game.UIMode.gameStart enter");
  },
  exit: function () {
    console.log("Game.UIMode.gameStart exit");
  },
  handleInput: function (eventType, evt) {
    console.log("Game.UIMode.gameStart handleInput");
    Game.switchUIMode(Game.UIMode.gamePersistence);
  },
  renderOnMain: function (display) {
    display.clear();
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(4,4, "Welcome to WSRL", fg, bg);
    display.drawText(4, 6, "Press any key to continue", fg, bg);
    console.log("Game.UIMode.gameStart renderOnMain");
  }
};

Game.UIMode.gamePlay = {
  attr: {
    _map: null,
    _mapWidth: 169,
    _mapHeight: 169,
    _cameraX: 84,
    _cameraY: 84,
    _avatar: null
  },
  JSON_KEY: 'uiMode_gamePlay',
  enter: function () {
    console.log("Game.UIMode.gamePlay enter");
    Game.Message.clearMessages();
    console.dir(JSON.parse(JSON.stringify(this.attr._map)));
    Game.refresh();
  },
  exit: function () {
    console.log("Game.UIMode.gamePlay exit");
  },
  handleInput: function (eventType, evt) {
    var pressedKey = String.fromCharCode(evt.charCode);
    Game.Message.sendMessage("you pressed the '"+String.fromCharCode(evt.charCode)+"' key");
    console.log("Game.UIMode.gamePlay handleInput");
    if(eventType == 'keypress'){
      if (evt.keyCode == 13) {
        Game.switchUIMode(Game.UIMode.gameWin);
        return;
      } else if (pressedKey == '1') {
        this.moveAvatar(-1,1);
      } else if (pressedKey == '2') {
        this.moveAvatar(0,1);
      } else if (pressedKey == '3') {
        this.moveAvatar(1,1);
      } else if (pressedKey == '4') {
        this.moveAvatar(-1,0);
      } else if (pressedKey == '5') {
        // do nothing / stay still
      } else if (pressedKey == '6') {
        this.moveAvatar(1,0);
      } else if (pressedKey == '7') {
        this.moveAvatar(-1,-1);
      } else if (pressedKey == '8') {
        this.moveAvatar(0,-1);
      } else if (pressedKey == '9') {
        this.moveAvatar(1,-1);
      }
    }
    if(eventType == 'keydown') {
      if (evt.keyCode == 27) {
        Game.switchUIMode(Game.UIMode.gameLose);
      } else if (evt.keyCode == 187) { // '='
        Game.switchUIMode(Game.UIMode.gamePersistence);
      }
    }
  },
  renderOnMain: function (display) {
    display.clear();
    display.setOptions({
        layout: "tile",
        bg: "transparent",
        tileWidth: 14,
        tileHeight: 14,
        tileSet: Game.tileSet,
        tileMap: {
            "@": [28, 14],
            "#": [0, 14],
            "+": [14, 0],
            " ": [14, 14],
            "b": [0, 0],
            "c": [0, 172],
            "d": [14, 129],
            "e": [115, 0],
            "f": [158, 0],
            "g": [186, 0],
            "h": [200, 0],
            "i": [215, 0],
            "j": [229, 0],
            "k": [85, 29],
            "l": [115, 172],
            "m": [158, 172],
            "n": [186, 172],
            "o": [200, 172],
            "p": [215, 172],
            "q": [229, 172],
            "r": [85, 200],
            "s": [115, 86],
            "t": [158, 86],
            "u": [186, 86],
            "v": [200, 86],
            "w": [215, 86],
            "x": [229, 86],
            "y": [85, 115],
            "z": [486, 0]
        }, width: 57, height: 26});
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    this.attr._map.renderOn(display, this.attr._cameraX, this.attr._cameraY);
    console.log("Game.UIMode.gamePlay renderOnMain");
    this.renderAvatar(display);
  },
  renderAvatar: function (display) {
    Game.Symbol.AVATAR.draw(display, Math.round(this.attr._avatar.getX()-this.attr._cameraX+display._options.width/2), Math.round(this.attr._avatar.getY()-this.attr._cameraY+display._options.height/2));
  },
  renderAvatarInfo: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,2,"avatar x: "+this.attr._avatar.getX(),fg,bg); // DEV
    display.drawText(1,3,"avatar y: "+this.attr._avatar.getY(),fg,bg);
  },
  moveAvatar: function (dx, dy) {
    if (this.attr._avatar.tryWalk(this.attr._map,dx,dy)) {
      this.setCameraToAvatar();
    }
  },
  moveCamera: function (dx,dy) {
  this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },
  setCamera: function (sx,sy) {
    this.attr._cameraX = Math.min(Math.max(0,sx),this.attr._mapWidth);
    this.attr._cameraY = Math.min(Math.max(0,sy),this.attr._mapHeight);
    Game.refresh();
  },
  setCameraToAvatar: function () {
    this.setCamera(this.attr._avatar.getX(),this.attr._avatar.getY());
  },
  setupPlay: function (restorationData) {
  var mapTiles = Game.mapgen.generate();

  // create map from the tiles
  this.attr._map =  new Game.Map(mapTiles);

  this.attr._avatar = new Game.Entity(Game.EntityTemplates.Avatar);
//  console.log(this.attr._avatar.mixins);
  // restore anything else if the data is available
  if (restorationData !== undefined && restorationData.hasOwnProperty(Game.UIMode.gamePlay.JSON_KEY)) {
    this.fromJSON(restorationData[Game.UIMode.gamePlay.JSON_KEY]);
  } else {
    this.attr._avatar.setPos(this.attr._map.getRandomWalkableLocation());
  }

  this.setCameraToAvatar();
},

toJSON: function() {
  return Game.UIMode.gamePersistence.BASE_toJSON.call(this);
},
fromJSON: function (json) {
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this,json);
}
};

Game.UIMode.gameLose = {
  enter: function () {
    console.log("Game.UIMode.gameLose enter");
  },
  exit: function () {
    console.log("Game.UIMode.gameLose exit");
  },
  handleInput: function (eventType, evt) {
    console.log("Game.UIMode.gameLose handleInput");
  },
  renderOnMain: function (display) {
    display.clear();
    display.drawText(4,4, "Defeat");
    console.log("Game.UIMode.gamePlay renderOnMain");

  },

};

Game.UIMode.gameWin = {
  enter: function () {
    console.log("Game.UIMode.gameWin enter");
  },
  exit: function () {
    console.log("Game.UIMode.gameWin exit");
  },
  handleInput: function (eventType, evt) {
    console.log("Game.UIMode.gameWin handleInput");
  },
  renderOnMain: function (display) {
    display.clear();
    display.drawText(4,4, "Victory");
    console.log("Game.UIMode.gamePlay renderOnMain");

  }
};

Game.UIMode.gamePersistence = {
   enter: function () {
     console.log('game persistence');
   },
   exit: function () {
   },
   renderOnMain: function (display) {
     var fg = Game.UIMode.DEFAULT_COLOR_FG;
     var bg = Game.UIMode.DEFAULT_COLOR_BG;
     display.clear();
     display.setOptions({bg: "#000", tileWidth: 14, tileHeight: 14, tileMap: {}, tileSet: null, layout: "rect",width: 80, height: 24});
     display.drawText(1,3,"press S to save the current game, L to load the saved game, or N start a new one",fg,bg);
  //   console.log('TODO: check whether local storage has a game before offering restore');
  //   console.log('TODO: check whether a game is in progress before offering restore');
   },
   handleInput: function (inputType,inputData) {
  //  console.log('gameStart inputType:');
  //  console.dir(inputType);
  //  console.log('gameStart inputData:');
  //  console.dir(inputData);
    var inputChar = String.fromCharCode(inputData.charCode);
    if (inputChar == 'S' || inputChar == 's') { // ignore the various modding keys - control, shift, etc.
      this.saveGame();
    } else if (inputChar == 'L' || inputChar == 'l') {
      this.restoreGame();
    } else if (inputChar == 'N' || inputChar == 'n') {
      this.newGame();
      console.log(Game.DISPLAYS.main.o.getOptions());
    }
  },

  saveGame: function (json_state_data) {
    console.log("save");
    if (Game.UIMode.gamePlay.attr._map !== null) {
      if (this.localStorageAvailable()) {
        window.localStorage.setItem(Game._PERSISTENCE_NAMESPACE, JSON.stringify(Game._game));
        Game.switchUIMode(Game.UIMode.gamePlay);
      }
    }
  },

  restoreGame: function () {
    console.log("restore");
    if (this.localStorageAvailable()) {
      var  json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
      setTimeout(function(){
        var state_data = JSON.parse(json_state_data);
        console.dir(JSON.parse(JSON.stringify(state_data)));
        Game.setRandomSeed(state_data._randomSeed);
        Game.UIMode.gamePlay.setupPlay(state_data);
        console.dir(Game.UIMode.gamePlay.attr._map);
        Game.switchUIMode(Game.UIMode.gamePlay);
      },1);
    }
  },

  newGame: function () {
    console.log("newGame");
    Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupPlay();
    Game.switchUIMode(Game.UIMode.gamePlay);
  },

  localStorageAvailable: function () { // NOTE: see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
     	try {
     		var x = '__storage_test__';
     		window.localStorage.setItem(x, x);
     		window.localStorage.removeItem(x);
     		return true;
     	}
     	catch(e) {
         Game.Message.send('Sorry, no local data storage is available for this browser');
     		return false;
     	}
  },
  BASE_toJSON: function(state_hash_name) {
    var state = this.attr;
    if (state_hash_name) {
      state = this[state_hash_name];
    }
    var json = {};
    for (var at in state) {
      if (state.hasOwnProperty(at)) {
        if (state[at] instanceof Object && 'toJSON' in state[at]) {
          json[at] = state[at].toJSON();
        } else {
          json[at] = state[at];
        }
      }
    }
      return json;
  },
  BASE_fromJSON: function (json,state_hash_name) {
    var using_state_hash = 'attr';
    if (state_hash_name) {
      using_state_hash = state_hash_name;
    }
    for (var at in this[using_state_hash]) {
      if (this[using_state_hash].hasOwnProperty(at)) {
        if (this[using_state_hash][at] instanceof Object && 'fromJSON' in this[using_state_hash][at]) {
          this[using_state_hash][at].fromJSON(json[at]);
        } else {
          this[using_state_hash][at] = json[at];
        }
      }
    }
  }
};
