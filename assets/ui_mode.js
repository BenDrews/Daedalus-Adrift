Game.UIMode = {};

Game.UIMode.gameStart = {
  enter: function () {
    console.log("Game.UIMode.gameStart enter");
  },
  exit: function () {
    console.log("Game.UIMode.gameStart exit");
  },
  handleInput: function () {
    console.log("Game.UIMode.gameStart handleInput");
  },
  renderOnMain: function (display) {
    display.clear();
    display.drawText(4,4, "Welcome to WSRL");
    display.drawText(4, 6, "Press any key to continue");
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
  handleInput: function () {
    console.log("Game.UIMode.gamePlay handleInput");
  },
  renderOnMain: function (display) {
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
  handleInput: function () {
    console.log("Game.UIMode.gameLose handleInput");
  },
  renderOnMain: function (display) {
console.log("Game.UIMode.gameLose renderOnMain");

  }
};

Game.UIMode.gameWin = {
  enter: function () {
    console.log("Game.UIMode.gameWin enter");
  },
  exit: function () {
    console.log("Game.UIMode.gameWin exit");
  },
  handleInput: function () {
    console.log("Game.UIMode.gameWing handleInput");
  },
  renderOnMain: function (display) {
console.log("Game.UIMode.gameWin renderOnMain");

  }
};
