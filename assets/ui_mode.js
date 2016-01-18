Game.UIMode = {DEFAULT_COLOR_STR:""};

//##############################################################################
//##############################################################################

Game.UIMode.gameStart = {
  enter: function () {
    console.log("Game.UIMode.gameStart enter");
  },
  exit: function () {
    Game.Message.clear();
    console.log("Game.UIMode.gameStart exit");
  },
  handleInput: function (eventType, evt) {
    console.log("Game.UIMode.gameStart handleInput");
    Game.switchUIMode('gamePersistence');
  },
  renderOnMain: function (display) {
    display.clear();
    display.drawText(4,4, Game.UIMode.DEFAULT_COLOR_STR+"Welcome to WSRL");
    display.drawText(4, 6, Game.UIMode.DEFAULT_COLOR_STR+"Press any key to continue");
  }
};

//##############################################################################
//##############################################################################

Game.UIMode.gamePlay = {
  paceMaker: null,
  attr: {
    _mapId: '',
    _cameraX: 84,
    _cameraY: 84,
    _avatarId: '',
    _enemyId: ''
  },
  JSON_KEY: 'uiMode_gamePlay',
  _audioSrc: null,
  actLoop: function() {
    for (var entID in Game.DATASTORE.ENTITY) {
      var entity = Game.DATASTORE.ENTITY[entID];
      if (entity._actions.length > 0) {
        entity.act();
      }
    }
  },
  destroyActLoop: function() {
    for (var entID in Game.DATASTORE.ENTITY) {
      var entity = Game.DATASTORE.ENTITY[entID];
      if (entity._actions.length > 0) {
        console.log(entity);
        entity.pauseAction();
      }
    }
  },
  enter: function () {
    Game.Message.clear();
    Game.DISPLAYS.main.o.setOptions(Game.tileSet.options);
    if(this.attr._avatarId) {
      this.setCameraToAvatar();
    }
    if(!Game._bgMusic || Game._bgMusic.src !== this._audioSrc) {
      Game._bgMusic = new Audio('assets/Unsettling_Discovery.mp3');
      Game._bgMusic.loop = true;
      this._audioSrc = Game._bgMusic.src;
      console.log('Audio reloaded: src' + Game._bgMusic.src);
    }
    Game._bgMusic.play();
    Game.UIMode.gamePlay.actLoop();
    this.paceMaker = setInterval(function() {Game.refresh();},50);
  },
  exit: function () {
    console.log("Game.UIMode.gamePlay exit");
    Game.DISPLAYS.main.o.setOptions({bg: "#000", tileWidth: 14, tileHeight: 14, tileMap: {}, tileSet: null, layout: "rect",width: 80, height: 24});
    Game._bgMusic.pause();
    Game.UIMode.gamePlay.destroyActLoop();
    clearInterval(this.paceMaker);
  },
  getMap: function () {
    return Game.DATASTORE.MAP[this.attr._mapId];
  },
  setMap: function (m) {
    this.attr._mapId = m.getId();
  },
  getAvatar: function () {
    return Game.DATASTORE.ENTITY[this.attr._avatarId];
  },
  setAvatar: function (a) {
    this.attr._avatarId = a.getId();
  },
  getEnemy: function () {
    return Game.DATASTORE.ENTITY[this.attr._enemyId];
  },
  setEnemy:function (e) {
    this.attr._enemyId = e.getId();
  },
  handleInput: function (inputType,inputData) {
    var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);
    if(!actionBinding) {
      return false;
    }
    if (actionBinding.actionKey == 'SET_MOVE_U') {
      this.getAvatar().setDirection(1);
    } else if (actionBinding.actionKey == 'SET_MOVE_R') {
      this.getAvatar().setDirection(2);
    } else if (actionBinding.actionKey == 'SET_MOVE_D') {
      this.getAvatar().setDirection(4);
    } else if (actionBinding.actionKey == 'SET_MOVE_L') {
      this.getAvatar().setDirection(8);
    } else if (actionBinding.actionKey == 'PERSISTENCE') {
      Game.switchUIMode('gamePersistence');
    }

    if (actionBinding.actionKey == 'UNSET_MOVE_U') {
      this.getAvatar().unsetDirection(1);
    } else if (actionBinding.actionKey == 'UNSET_MOVE_R') {
      this.getAvatar().unsetDirection(2);
    } else if (actionBinding.actionKey == 'UNSET_MOVE_D') {
      this.getAvatar().unsetDirection(4);
    } else if (actionBinding.actionKey == 'UNSET_MOVE_L') {
      this.getAvatar().unsetDirection(8);
    }
  },
  renderOnMain: function (display) {
    var seenCells = this.getAvatar().getVisibleCells();
    this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY,{
      visibleCells:seenCells,
      maskedCells:this.getAvatar().getRememberedCoordsForMap()
    });
    this.getAvatar().rememberCoords(seenCells);
  },
  renderOnAvatar: function(display) {
    if(this.getAvatar()) {
      display.drawText(1,2,Game.UIMode.DEFAULT_COLOR_STR+"Avatar X: "+this.getAvatar().getX()); // DEV
      display.drawText(1,3,Game.UIMode.DEFAULT_COLOR_STR+"Avatar Y: "+this.getAvatar().getY());
      display.drawText(1,4,Game.UIMode.DEFAULT_COLOR_STR+"Units moved: "+this.getAvatar().getMoves());
    }
    if(this.getEnemy()) {
      display.drawText(1,5,Game.UIMode.DEFAULT_COLOR_STR+"Enemy X: "+this.getEnemy().getX());
      display.drawText(1,6,Game.UIMode.DEFAULT_COLOR_STR+"Enemy Y: "+this.getEnemy().getY());
    }
  },
  moveAvatar: function (dx, dy) {
    if (this.getAvatar().tryWalk(this.getMap(),dx,dy)) {
      this.setCameraToAvatar();
    }
  },
  moveCamera: function (dx,dy) {
  this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },
  setCamera: function (sx,sy) {
    //TODO: Swap 13 with an attribute, and 7, and 1.
    this.attr._cameraX = Math.max(0,sx - ((sx + 1) % 13)) + 7;
    this.attr._cameraY = Math.max(0,sy - ((sy + 1) % 13)) + 7;
  },
  setCameraToAvatar: function () {
    this.setCamera(this.getAvatar().getX(),this.getAvatar().getY());
  },
  setupNewGame: function (restorationData) {
  this.setMap(new Game.Map('spaceship1'));
  this.setAvatar(Game.EntityGenerator.create('avatar'));
  this.setEnemy(Game.EntityGenerator.create('enemy'));

  this.getMap().addEntity(this.getAvatar(), this.getMap().getRandomWalkableLocation());
  this.getMap().addEntity(this.getEnemy(), this.getMap().getRandomWalkableLocation());
  this.setCameraToAvatar();

  // TODO: delete dev code
  for(var ecount = 0; ecount < 80; ecount++) {
    this.getMap().addEntity(Game.EntityGenerator.create('slime'),this.getMap().getRandomWalkableLocation());
  }
},

toJSON: function() {
  return Game.UIMode.gamePersistence.BASE_toJSON.call(this);
},
fromJSON: function (json) {
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this,json);
}
};

//##############################################################################
//##############################################################################

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
    display.drawText(4,4, Game.UIMode.DEFAULT_COLOR_STR+"Defeat");
    console.log("Game.UIMode.gamePlay renderOnMain");

  },

};

//##############################################################################
//##############################################################################

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
    display.drawText(4,4, Game.UIMode.DEFAULT_COLOR_STR+"Victory");
    console.log("Game.UIMode.gamePlay renderOnMain");

  }
};

//##############################################################################
//##############################################################################

Game.UIMode.gamePersistence = {
  RANDOM_SEED_KEY: 'gameRandomSeed',
  _storedKeyBinding: '',
   enter: function () {
     console.log('game persistence');
     this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
     Game.KeyBinding.setKeyBinding('persist');
   },
   exit: function () {
     Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
   },
   renderOnMain: function (display) {
     display.clear();
     display.drawText(1,3,Game.UIMode.DEFAULT_COLOR_STR+"Press S to save the current game, L to load the saved game, or N start a new one");
  //   console.log('TODO: check whether local storage has a game before offering restore');
  //   console.log('TODO: check whether a game is in progress before offering restore');
   },
   handleInput: function (inputType,inputData) {
     var actionBinding = Game.KeyBinding.getInputBinding(inputType, inputData);
     console.log("input in persist");
     console.dir(actionBinding);
     if(!actionBinding) {
       return false;
     }
     if(actionBinding.actionKey == 'PERSISTENCE_SAVE') {
       this.saveGame();
     } else if(actionBinding.actionKey == 'PERSISTENCE_LOAD') {
       this.restoreGame();
     } else if(actionBinding.actionKey == 'PERSISTENCE_NEW') {
       this.newGame();
       Game.switchUIMode('gamePlay');
     }
     return false;
 },

  saveGame: function () {
    if (Game.UIMode.gamePlay.getMap() !== null) {
      if (this.localStorageAvailable()) {
        Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
        Game.DATASTORE.MESSAGES = Game.Message.attr;
        Game.DATASTORE.KEY_BINDING = this._storedKeyBinding;
        window.localStorage.setItem(Game._PERSISTENCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
        Game.Message.send('Game saved.');
        Game.switchUIMode('gamePlay');
      }
    }
  },

  restoreGame: function () {
    console.log("restore");
    if (this.localStorageAvailable()) {
    //  Game.initializeTimingEngine();
      var  json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
      if(json_state_data === null) {
        Game.Message.send("No saved game.");
        return false;
      }
      setTimeout(function(){
        var state_data = JSON.parse(json_state_data);
        console.log('state data: ');
        console.dir(state_data);

        console.log(Game.UIMode.gamePersistence.RANDOM_SEED_KEY);
        // game level stuff
        Game.setRandomSeed(state_data[Game.UIMode.gamePersistence.RANDOM_SEED_KEY]);

        // maps
        for (var mapId in state_data.MAP) {
          if (state_data.MAP.hasOwnProperty(mapId)) {
            var mapAttr = JSON.parse(state_data.MAP[mapId]);
            console.log("restoring map "+mapId+" with attributes:");
            console.dir(JSON.parse(JSON.stringify(mapAttr)));
            Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName);
            //Game.DATASTORE.MAP[mapId].attr = mapAttr;
            Game.DATASTORE.MAP[mapId].fromJSON(state_data.MAP[mapId]);
            Game.Message.send('Map loaded.');
          }
        }

        // entities
        for (var entityId in state_data.ENTITY) {
          if (state_data.ENTITY.hasOwnProperty(entityId)) {
            var entAttr = JSON.parse(state_data.ENTITY[entityId]);
            var newE = Game.EntityGenerator.create(entAttr._generator_template_key,entAttr._id);
            Game.DATASTORE.ENTITY[entityId] = newE;
            Game.DATASTORE.ENTITY[entityId].fromJSON(state_data.ENTITY[entityId]);
            Game.Message.send('Entities loaded.');
          }
        }

        // game play et al
        Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
        Game.Message.attr = state_data.MESSAGES;
        this._storedKeyBinding = state_data.KEY_BINDING;

        Game.switchUIMode('gamePlay');
      },1);
    }
  },

  newGame: function () {
  //  Game.initializeTimingEngine();
    console.log("newGame");
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupNewGame();
    Game.switchUIMode('gamePlay');
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
    var json = JSON.stringify(state);
      return json;
  },
  BASE_fromJSON: function (json,state_hash_name) {
    var using_state_hash = 'attr';
    if (state_hash_name) {
      using_state_hash = state_hash_name;
    }
    this[using_state_hash] = JSON.parse(json);
  }
};


//##############################################################################
//##############################################################################

Game.UIMode.LAYER_textReading = {
    _storedKeyBinding: '',
    _storedDisplayOptions: null,
    _text: 'Default text layer',
    _renderY: 0,
    _renderScrollLimit: 0,
    enter: function() {
      this._renderY = 0;
      this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
      Game.KeyBinding.setKeyBinding('LAYER_textReading');
      var display = Game.DISPLAYS.main.o;
      var options = display.getOptions();
      this._storedDisplayOptions = {};
      for (var optionKey in options) {
        this._storedDisplayOptions[optionKey] = display.getOptions()[optionKey];
      }
      display.setOptions({bg: "#000", tileWidth: 14, tileHeight: 14, tileMap: {}, tileSet: null, layout: "rect",width: 80, height: 24});
      Game.specialMessage("[Esc] to exit, [ and ] for scrolling");
      Game.refresh();
    },
    exit: function() {
      Game.setKeyBinding(this._storedKeyBinding);
      Game.DISPLAYS.main.o.setOptions(this._storedDisplayOptions);
      Game.refresh();
    },
    renderOnMain: function(display) {
      var dims = Game.util.getDisplayDim(display);
      var linesTaken = display.drawText(1,this._renderY,Game.UIMode.DEFAULT_COLOR_STR+"text is "+this._text, dims.w-2);
      this._renderScrollLimit = dims.h - linesTaken;
      if (this._renderScrollLimit > 0) { this._renderScrolLimit=0;}
    },
    handleInput: function(inputType, inputData) {
      Game.Message.clear();
      var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);
      if (actionBinding.actionKey == 'CANCEL') {
        Game.popUIMode();
      }

      if (inputType === 'keydown' && inputData.keyCode === 219) {
        this._renderY++;
        if (this._renderY > 0) { this._renderY = 0; }
        Game.renderMain();
        return true;
      } else if (inputType === 'keydown' && inputData.keyCode === 221) {
          this._renderY--;
          if (this._renderY < this._renderScrollLimit) { this._renderY = this._renderScrollLimit; }
          Game.renderMain();
          return true;
        }
      return false;
    },
    getText: function() {
      return this._text;
    },
    setText: function(text){
      this._text = text;
    }
};
