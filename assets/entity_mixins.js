Game.EntityMixin = {};

// Mixins have a META property is is info about/for the mixin itself and then all other properties. The META property is NOT copied into objects for which this mixin is used - all other properies ARE copied in.
Game.EntityMixin.PlayerActor = {
  META: {
    mixinName: 'PlayerActor',
    mixinGroup: 'Actor',
    stateNamespace: '_PlayerActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000,
      direction: 0,
      canMove: true
    },
    init: function (template) {
  //    Game.Scheduler.add(this,true,1);
    },
    listeners: {
      'actionDone': function(evtData) {
  //      Game.Scheduler.setDuration(this.getCurrentActionDuration());
        this.setCurrentActionDuration(this.getBaseActionDuration());
      }
    }
  },
  getBaseActionDuration: function () {
    return this.attr._PlayerActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._PlayerActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._PlayerActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._PlayerActor_attr.currentActionDuration = n;
  },
  isActing: function (state) {
    if (state !== undefined) {
      this.attr._PlayerActor_attr.actingState = state;
    }
    return this.attr._PlayerActor_attr.actingState;
  },
  setMovable: function (canMove) {
    this.attr._PlayerActor_attr.canMove = canMove;
  },
  setDirection: function (dir) {
    this.attr._PlayerActor_attr.direction = this.attr._PlayerActor_attr.direction | dir;
  },
  unsetDirection: function (dir) {
    this.attr._PlayerActor_attr.direction = this.attr._PlayerActor_attr.direction & (~dir);
  },
  act: function () {
    console.log("acting");
    if (this.isActing()) { return; } // a gate to deal with JS timing issues
    this.isActing(true);
    if(this.attr._PlayerActor_attr.canMove && this.hasOwnProperty('tryWalk')) {
        var dx = 0;
        var dy = 0;
        if(this.attr._PlayerActor_attr.direction & 1) {
          dy--;
        }
        if(this.attr._PlayerActor_attr.direction & 2) {
          dx++;
        }
        if(this.attr._PlayerActor_attr.direction & 4) {
          dy++;
        }
        if(this.attr._PlayerActor_attr.direction & 8) {
          dx--;
        }
        Game.UIMode.gamePlay.moveAvatar(dx,dy);
        this.setMovable(false);
        if(Math.abs(dx) + Math.abs(dy) == 2) {
          setTimeout(function () {Game.UIMode.gamePlay.getAvatar().setMovable(true);},75 * Math.sqrt(2));
        } else {
          setTimeout(function () {Game.UIMode.gamePlay.getAvatar().setMovable(true);},75);
        }
    }
  //  Game.TimeEngine.lock();
    this.raiseEntityEvent('actionDone');
    this.isActing(false);
    var curObj = this;
    curObj.attr._PlayerActor_attr.timeout = setTimeout(function() {curObj.act();}, 50);
  },

  pauseAction: function() {
    var curObj = this;
    if (curObj.attr._PlayerActor_attr.timeout){
      clearTimeout(curObj.attr._PlayerActor_attr.timeout);
    }
  }
};

Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker'
  },
  tryWalk: function (map,dx,dy) {
    var targetX = Math.min(Math.max(0,this.getX() + dx),map.getWidth());
    var targetY = Math.min(Math.max(0,this.getY() + dy),map.getHeight());
    if (map.getEntity(targetX,targetY)) { //Currently cannot walk into tiles occupied by other entities
      // NOTE: attack/interact handling would go here
      return false;
    }
    if (map.getTile(targetX,targetY).isWalkable()) {
      this.setPos(targetX,targetY);
      var myMap = this.getMap();
      if (myMap){
        myMap.updateEntityLocation(this);
      }
      if (this.hasMixin('Chronicle')) { // NOTE: this is sub-optimal because it couple this mixin to the Chronicle one (i.e. this needs to know the Chronicle function to call) - the event system will solve this issue
        this.trackTurn();
      }
      return true;
    }
    return false;
  }
};

Game.EntityMixin.Chronicle = {
  META: {
    mixinName: 'Chronicle',
    mixinGroup: 'Chronicle',
    stateNamespace: '_Chronicle_attr',
    stateModel:  {
      turnCounter: 0
    }
  },
  trackTurn: function () {
    this.attr._Chronicle_attr.turnCounter++;
  },
  getTurns: function () {
    return this.attr._Chronicle_attr.turnCounter;
  },
  setTurns: function (n) {
    this.attr._Chronicle_attr.turnCounter = n;
  }
};

Game.EntityMixin.HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroup: 'HitPoints',
    stateNamespace: '_HitPoints_attr',
    stateModel:  {
      maxHp: 1,
      curHp: 1
    },
    init: function (template) {
      this.attr._HitPoints_attr.maxHp = template.maxHp || 1;
      this.attr._HitPoints_attr.curHp = template.curHp || this.attr._HitPoints_attr.maxHp;
    }
  },
  getMaxHp: function () {
    return this.attr._HitPoints_attr.maxHp;
  },
  setMaxHp: function (n) {
    this.attr._HitPoints_attr.maxHp = n;
  },
  getCurHp: function () {
    return this.attr._HitPoints_attr.curHp;
  },
  setCurHp: function (n) {
    this.attr._HitPoints_attr.curHp = n;
  },
  takeHits: function (amt) {
    this.attr._HitPoints_attr.curHp -= amt;
  },
  recoverHits: function (amt) {
    this.attr._HitPoints_attr.curHp = Math.min(this.attr._HitPoints_attr.curHp+amt,this.attr._HitPoints_attr.maxHp);
  }
};

Game.EntityMixin.WanderActor = {
  META: {
    mixinName: 'WanderActor',
    mixinGroup: 'Actor',
    stateNamespace: '_WanderActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000,
      timeout: null
    },
    init: function (template) {
//      Game.Scheduler.add(this,true, 2);
    }
  },
  getBaseActionDuration: function () {
    return this.attr._WanderActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._WanderActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._WanderActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._WanderActor_attr.currentActionDuration = n;
  },
  getMoveDeltas: function () {
    return Game.util.positionsAdjacentTo({x:0,y:0}).random();
  },
  act: function () {
//  Game.TimeEngine.lock();
     console.log("begin wander acting");
    // console.log('wander for '+this.getName());
    var moveDeltas = this.getMoveDeltas();
    if (this.hasMixin('Walker')) { // NOTE: this pattern suggests that maybe tryWalk shoudl be converted to an event
      // console.log('trying to walk to '+moveDeltas.x+','+moveDeltas.y);
      this.tryWalk(Game.UIMode.gamePlay.getMap(), moveDeltas.x, moveDeltas.y);
    }
  //  Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration());
    this.raiseEntityEvent('actionDone');
    // console.log("end wander acting");
    //Game.TimeEngine.unlock();
    var curObj = this;
    curObj.attr._WanderActor_attr.timeout = setTimeout(function() {curObj.act();}, 50);
  },

  pauseAction: function() {
    var curObj = this;
    if (curObj.attr._WanderActor_attr.timeout){
      clearTimeout(curObj.attr._WanderActor_attr.timeout);
    }
  }
};
