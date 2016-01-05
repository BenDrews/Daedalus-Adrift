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
  enter: function () {
    console.log("Game.UIMode.gamePlay enter");
  },
  exit: function () {
    console.log("Game.UIMode.gamePlay exit");
  },
  handleInput: function (eventType, evt) {
    console.log("Game.UIMode.gamePlay handleInput");
    if(eventType == 'keypress' && evt.keyCode == 13){
      Game.switchUIMode(Game.UIMode.gameWin);
    }
    if(eventType == 'keydown' && evt.keyCode == 27) {
      Game.switchUIMode(Game.UIMode.gameLose);
    }
  },
  renderOnMain: function (display) {
    display.clear();
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(4,4, "Press [Enter] to win and [Esc] to lose");
    display.drawText(1,5, "press = to save, restore, or start a new game", fg, bg);
    console.log("Game.UIMode.gamePlay renderOnMain");
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

  }
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
   render: function (display) {
     var fg = Game.UIMode.DEFAULT_COLOR_FG;
     var bg = Game.UIMode.DEFAULT_COLOR_BG;
     display.drawText(1,3,"press S to save the current game, L to load the saved game, or N start a new one",fg,bg);
     console.log('TODO: check whether local storage has a game before offering restore');
     console.log('TODO: check whether a game is in progress before offering restore');
   },
   handleInput: function (inputType,inputData) {
  //  console.log('gameStart inputType:');
  //  console.dir(inputType);
  //  console.log('gameStart inputData:');
  //  console.dir(inputData);
    var inputChar = String.fromCharCode(inputData.charCode);
    if (inputChar == 'S') { // ignore the various modding keys - control, shift, etc.
      this.saveGame();
    } else if (inputChar == 'L') {
      this.restoreGame();
    } else if (inputChar == 'N') {
      this.newGame();
    }
  },
  restoreGame: function () {
    var  json_state_data = '{"randomSeed":12}';
    console.log('TODO: implement recovering game state from local storage');
    var state_data = JSON.parse(json_state_data);
    console.dir(state_data);
    Game.setRandomSeed(state_data.randomSeed);
    console.log("post-restore: using random seed "+Game.getRandomSeed());
    Game.switchUiMode(Game.UIMode.gamePlay);
  },
  saveGame: function (json_state_data) {
    console.log('TODO: implement saving game state to local storage');
    Game.switchUiMode(Game.UIMode.gamePlay);
  },
  newGame: function () {
    Game.setRandomSeed(5 + Math.floor(Math.random()*100000));
    Game.switchUiMode(Game.UIMode.gamePlay);
  }
};
