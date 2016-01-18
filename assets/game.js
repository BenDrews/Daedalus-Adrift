console.log("hello console");

window.onload = function() {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // Initialize the game
        Game.init();

        // Add the containers to our HTML page
        document.getElementById('wsrl-avatar-display').appendChild(   Game.getDisplay('avatar').getContainer());
        document.getElementById('wsrl-main-display').appendChild(   Game.getDisplay('main').getContainer());
        document.getElementById('wsrl-message-display').appendChild(   Game.getDisplay('message').getContainer());

        Game.Message.send("Welcome to WSRL");
        Game.switchUIMode('gameStart');
        Game.renderMain();

        Game.KeyBinding.setKeyBinding();
    }
};

var Game = {
  DISPLAYS: {
    avatar: {
      w: 20,
      h: 24,
      o: null
    },
    main: {
      w: 80,
      h: 24,
      o: null
    },
    message: {
      w: 100,
      h: 6,
      o: null
    },
  },
  _PERSISTENCE_NAMESPACE: 'wsrlgame',
  _game: null,
  _uiModeNameStack: [],
  _randomSeed: 0,
  TRANSIENT_RNG: null,
  _bgMusic: null,
  DATASTORE: {},
  TimeEngine: null,
  init: function () {
    this._game = this;
    this.TRANSIENT_RNG = ROT.RNG.clone();
    Game.setRandomSeed(5 + Math.floor(this.TRANSIENT_RNG.getUniform()*100000));

    console.log("RogueLike initialization");
    for (var displayName in this.DISPLAYS) {
      if(this.DISPLAYS.hasOwnProperty(displayName)){
        console.log("Initializing display: " + displayName);
        this.DISPLAYS[displayName].o = new ROT.Display({width:Game.DISPLAYS[displayName].w, height:Game.DISPLAYS[displayName].h});
      }
    }
    var bindEventToScreen = function(eventType) {
      window.addEventListener(eventType, function(evt) {
        Game.eventHandler(eventType, evt);
      });
    };
    bindEventToScreen('keypress');
    bindEventToScreen('keydown');
    bindEventToScreen('keyup');
    this.switchUIMode('gameStart');
    this.renderAll();
  },
  getRandomSeed: function () {
    return this._randomSeed;
  },
  setRandomSeed: function (s) {
    this._randomSeed = s;
    console.log("using random seed " +this._randomSeed);
    this.DATASTORE[Game.UIMode.gamePersistence.RANDOM_SEED_KEY] = this._randomSeed;
    ROT.RNG.setSeed(this._randomSeed);
  },
  getDisplay: function(displayName){
    return Game.DISPLAYS[displayName].o;
  },
  refresh: function () {
    this.renderAll();
  },
  renderAll: function() {
    this.renderAvatar();
    this.renderMain();
    this.renderMessage();
  },
  renderAvatar: function() {
    this.DISPLAYS.avatar.o.clear();
    if (this.getCurUIMode() && this.getCurUIMode().hasOwnProperty('renderOnAvatar')) {
      this.getCurUIMode().renderOnAvatar(this.DISPLAYS.avatar.o);
    }
  },
  renderMain: function() {
    this.DISPLAYS.main.o.clear();
    if (this.getCurUIMode() && this.getCurUIMode().hasOwnProperty('renderOnMain')) {
      this.getCurUIMode().renderOnMain(this.DISPLAYS.main.o);
    } else {
      this.DISPLAYS.main.o.drawText(2, 1, "Main display");
    }
  },
  renderMessage: function() {
  Game.Message.renderOn(this.DISPLAYS.message.o);
},
  hideDisplayMessage: function() {
    this.DISPLAYS.message.o.clear();
  },
  specialMessage: function(msg) {
    this.DISPLAYS.message.o.clear();
    this.DISPLAYS.message.o.drawText(1,1,'%c{#fff}%b{#000}'+msg,79);
  },
getCurUIMode: function () {
    var uiModeName = this._uiModeNameStack[0];
    if (uiModeName) {
      return Game.UIMode[uiModeName];
      }
    return null;
  },
  switchUIMode: function (newUiModeName) {
    if (newUiModeName.startsWith('LAYER_')) {
      console.log('cannot switchUiMode to layer '+newUiModeName);
      return;
    }
    var curMode = this.getCurUIMode();
    if (curMode !== null) {
      curMode.exit();
    }
    this._uiModeNameStack[0] = newUiModeName;
    var newMode = Game.UIMode[newUiModeName];
    if (newMode) {
      newMode.enter();
    }
    this.renderAll();
  },
  pushUIMode: function (newUiModeLayerName) {
    if (! newUiModeLayerName.startsWith('LAYER_')) {
      console.log('addUiMode not possible for non-layer '+newUiModeLayerName);
      return;
    }
    this._uiModeNameStack.unshift(newUiModeLayerName);
    var newMode = Game.UIMode[newUiModeLayerName];
    if (newMode) {
      newMode.enter();
      }
      this.renderAll();
  },
  popUIMode: function () {
    var curMode = this.getCurUIMode();
    if (curMode !== null) {
      curMode.exit();
    }
    this._uiModeNameStack.shift();
    this.renderAll();
  },
  getAvatar: function () {
    return Game.UIMode.gamePlay.getAvatar();
  },
  eventHandler: function(eventType, evt) {
    if (this.getCurUIMode() && this.getCurUIMode().hasOwnProperty('handleInput')) {
      this.getCurUIMode().handleInput(eventType, evt);
    }
  }
  //TODO: toJSON method
};
