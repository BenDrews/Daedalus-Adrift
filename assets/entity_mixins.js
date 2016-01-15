Game.EntityMixin = {};

Game.EntityMixin.PlayerMessager = {
  META: {
    mixinName: 'PlayerMessager',
    mixinGroup: 'PlayerMessager',
    listeners: {
      'walkForbidden': function(evtData) {
        Game.Message.send('you can\'t walk into the '+evtData.target.getName());
      },
      'dealtDamage': function(evtData) {
        Game.Message.send('you hit the '+evtData.damagee.getName()+' for '+evtData.damageAmount);
      },
      'madeKill': function(evtData) {
        Game.Message.send('you killed the '+evtData.entKilled.getName());
      },
      'damagedBy': function(evtData) {
        Game.Message.send('the '+evtData.damager.getName()+' hit you for '+evtData.damageAmount);
      },
      'killed': function(evtData) {
        Game.Message.send('you were killed by the '+evtData.killedBy.getName());
      }
    }
  }
//    Game.Message.send(msg);
};
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
      },
      'killed': function(evtData) {
        Game.switchUIMode(Game.UIMode.gameLose);
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
    curEntity = this;
    if(this.attr._PlayerActor_attr.canMove && this.hasMixin('WalkerCorporeal')) {
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
        if(dx !== 0 || dy !== 0) {
          Game.UIMode.gamePlay.moveAvatar(dx,dy);
          this.setMovable(false);
          if(Math.abs(dx) + Math.abs(dy) == 2) {
            setTimeout(function () {curEntity.setMovable(true);},75 * Math.sqrt(2));
          } else {
            setTimeout(function () {curEntity.setMovable(true);},75);
          }
        }
    }
    this.raiseEntityEvent('actionDone');
    this.attr._PlayerActor_attr.timeout = setTimeout(function() {curEntity.act();}, 50);
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
    var targetEnt = map.getEntity(targetX, targetY);
    if (targetEnt && targetEnt != this) {
      console.dir([this, map.getEntity(targetX, targetY)]);
      this.raiseEntityEvent('bumpEntity',{actor:this,recipient:map.getEntity(targetX,targetY)});
      return false;
    }
    var targetTile = map.getTile(targetX,targetY);
    if (targetTile.isWalkable()) {
      this.setPos(targetX,targetY);
      var myMap = this.getMap();
      if (myMap){
        if ((dx !== 0) || (dy !== 0)) {
          this.raiseEntityEvent('movedUnit');
          myMap.updateEntityLocation(this);
        }
      }
      return true;
    }
    this.raiseEntityEvent('walkForbidden',{target:targetTile});
    return false;
  }
};

Game.EntityMixin.Chronicle = {
  META: {
    mixinName: 'Chronicle',
    mixinGroup: 'Chronicle',
    stateNamespace: '_Chronicle_attr',
    stateModel:  {
      moveCounter: 0,
      killLog:{},
      deathMessage:''
    },
    listeners: {
      'movedUnit': function(evtData) {
        this.trackMove();
      },
      'madeKill': function(evtData) {
        console.log('chronicle kill');
        this.addKill(evtData.entKilled);
      },
      'killed': function(evtData) {
        this.attr._Chronicle_attr.deathMessage = 'killed by '+evtData.killedBy.getName();
      }
    }
  },
  trackMove: function () {
    this.attr._Chronicle_attr.moveCounter++;
  },
  getMoves: function () {
    return this.attr._Chronicle_attr.moveCounter;
  },
  setMoves: function (n) {
    this.attr._Chronicle_attr.moveCounter = n;
  },
  getKills: function () {
    return this.attr._Chronicle_attr.killLog;
  },
  clearKills: function () {
    this.attr._Chronicle_attr.killLog = {};
  },
  addKill: function (entKilled) {
    var entName = entKilled.getName();
    console.log('chronicle kill of '+entName);
    if (this.attr._Chronicle_attr.killLog[entName]) {
      this.attr._Chronicle_attr.killLog[entName]++;
  } else {
      this.attr._Chronicle_attr.killLog[entName] = 1;
    }
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
    },
    listeners: {
      'attacked': function(evtData) {
        console.log('HitPoints attacked');

        this.takeHits(evtData.attackPower);
        this.raiseEntityEvent('damagedBy',{damager:evtData.attacker,damageAmount:evtData.attackPower});
        evtData.attacker.raiseEntityEvent('dealtDamage',{damagee:this,damageAmount:evtData.attackPower});
        if (this.getCurHp() <= 0) {
          this.raiseEntityEvent('killed',{entKilled: this, killedBy: evtData.attacker});
          evtData.attacker.raiseEntityEvent('madeKill',{entKilled: this, killedBy: evtData.attacker});
        }
      },
      'killed': function(evtData) {
        console.log('HitPoints killed');
        this.destroy();
      }
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
    var avatar = Game.UIMode.gamePlay.getAvatar();
      // build a path instance for the avatar
      var source = this;
      var map = this.getMap();
      if (avatar !== undefined) {
        var avatarX = avatar.getX();
        var avatarY = avatar.getY();
      var path = new ROT.Path.AStar(avatarX, avatarY, function(x, y) {
          // If an entity is present at the tile, can't move there.
          var entity = map.getEntity(x, y);
          if (entity && entity !== avatar && entity !== source) {
              return false;
          }
          return map.getTile(x, y).isWalkable();
      }, {topology: 8});

      // compute the path from here to there
      var count = 0;
      var moveDeltas = {x:0,y:0};
      path.compute(this.getX(), this.getY(), function(x, y) {
          if (count == 1) {
              moveDeltas.x = x - source.getX();
              moveDeltas.y = y - source.getY();
          }
          count++;
      });
      return moveDeltas;
    } else {
      return {x:0, y:0};
    }
  },
  act: function () {
    // console.log("begin wander acting");
    // console.log('wander for '+this.getName());
    var moveDeltas = this.getMoveDeltas();
    if (this.hasMixin('Walker')) { // NOTE: this pattern suggests that maybe tryWalk shoudl be converted to an event
      this.tryWalk(Game.UIMode.gamePlay.getMap(), moveDeltas.x, moveDeltas.y);
    }
    this.setCurrentActionDuration(this.getBaseActionDuration()+Game.util.randomInt(-10,10));
    this.raiseEntityEvent('actionDone');
    var curObj = this;
    curObj.attr._WanderActor_attr.timeout = setTimeout(function() {curObj.act();}, 250);
    // console.log("end wander acting");
  },
  act2: function () {
    // console.log("begin wander acting");
    // console.log('wander for '+this.getName());
    var moveDeltas = this.getMoveDeltas();
    if (this.hasMixin('Walker')) { // NOTE: this pattern suggests that maybe tryWalk shoudl be converted to an event
      this.tryWalk(Game.UIMode.gamePlay.getMap(), moveDeltas.x, moveDeltas.y);
    }
    this.setCurrentActionDuration(this.getBaseActionDuration()+Game.util.randomInt(-10,10));
    this.raiseEntityEvent('actionDone');
    var curObj = this;
    curObj.attr._WanderActor_attr.timeout = setTimeout(function() {curObj.act2();}, 550);
    // console.log("end wander acting");
  },
  pauseAction: function() {
    var curObj = this;
    if (curObj.attr._WanderActor_attr.timeout){
      clearTimeout(curObj.attr._WanderActor_attr.timeout);
    }
  }

};

Game.EntityMixin.ShooterActor = {
  META: {
    mixinName: 'ShooterActor',
    mixinGroup: 'Actor',
    stateNamespace: '_ShooterActor_attr',
    stateModel:  {
      baseActionDuration: 1500,
      currentActionDuration: 1500,
      timeout: null,
      integer: 0
    },
    init: function (template) {
//      Game.Scheduler.add(this,true, 2);
    }
  },
  getBaseActionDuration: function () {
    return this.attr._ShooterActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._ShooterActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._ShooterActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._ShooterActor_attr.currentActionDuration = n;
  },
  getMoveDeltas: function () {
    return Game.util.positionsAdjacentTo({x:0,y:0}).random();
  },
  act: function () {
    var moveDeltas = this.getMoveDeltas();
    if (this.hasMixin('Walker')) { // NOTE: this pattern suggests that maybe tryWalk shoudl be converted to an event
      this.tryWalk(Game.UIMode.gamePlay.getMap(), moveDeltas.x, moveDeltas.y);
    }
    if (this.attr._ShooterActor_attr.integer >= 50) {
      var projectile = Game.EntityGenerator.create('projectile');
      Game.UIMode.gamePlay.getMap().addEntity(projectile, this.getPos());
      projectile.act2();
      projectile.attr._Projectile_attr.firedBy = this;
      console.log(projectile);
      this.attr._ShooterActor_attr.integer = 0;
    } else {
      this.attr._ShooterActor_attr.integer += 1;
    }
  //projectile.attr._Projectile_attr.firedBy = this;

    //projectile.attr._Projectile_attr.firedBy = this;
    this.setCurrentActionDuration(this.getBaseActionDuration());
    this.raiseEntityEvent('actionDone');
    var curObj = this;
    curObj.attr._ShooterActor_attr.timeout = setTimeout(function() {curObj.act();}, 150);
  },

  pauseAction: function() {
    var curObj = this;
    if (curObj.attr._ShooterActor_attr.timeout){
      clearTimeout(curObj.attr._ShooterActor_attr.timeout);
    }
  }
};

Game.EntityMixin.MeleeAttacker = {
  META: {
    mixinName: 'MeleeAttacker',
    mixinGroup: 'Attacker',
    stateNamespace: '_MeleeAttacker_attr',
    stateModel:  {
      attackPower: 1,
    },
    init: function (template) {
      this.attr._MeleeAttacker_attr.attackPower = template.attackPower || 1;
    },
    listeners: {
      'bumpEntity': function(evtData) {
        console.log('MeleeAttacker bumpEntity' + evtData.actor.attr._name + " potatoes" + evtData.recipient.attr._name);
        evtData.recipient.raiseEntityEvent('attacked',{attacker:evtData.actor,attackPower:this.getAttackPower()});
      }
    }
  },
  getAttackPower: function () {
    return this.attr._MeleeAttacker_attr.attackPower;
  }
};

Game.EntityMixin.Projectile = {
  META: {
    mixinName: 'Projectile',
    mixinGroup: 'Projectile',
    stateNamespace: '_Projectile_attr',
    stateModel:  {
      attackPower: 1,
      firedBy: null,
      direction: 0
    },
    init: function (template) {
      this.attr._Projectile_attr.attackPower = template.attackPower || 1;
    },
    listeners: {
      'bumpEntity': function(evtData) {
        if (this.attr._Projectile_attr.firedBy!== evtData.recipient) {
        console.log('Projectile bumpEntity' + evtData.actor.attr._name + "lava " + evtData.recipient.attr._name);
        evtData.recipient.raiseEntityEvent('attacked',{attacker:evtData.actor.attr._Projectile_attr.firedBy,attackPower:this.getAttackPower()});
        this.destroy();
        }

      }
    }
  },
  getAttackPower: function () {
    return this.attr._Projectile_attr.attackPower;
  }
};

Game.EntityMixin.Sight = {
  META: {
    mixinName: 'Sight',
    mixinGroup: 'Sense',
    stateNamespace: '_Sight_attr',
    stateModel:  {
      sightRadius: 13
    },
    init: function (template) {
      this.attr._Sight_attr.sightRadius = template.sightRadius || 13;
    }
  },
  getSightRadius: function () {
    return this.attr._Sight_attr.sightRadius;
  },
  setSightRadius: function (n) {
    this.attr._Sight_attr.sightRadius = n;
  },

  canSeeEntity: function(entity) {
      // If not on the same map or on different maps, then exit early
      if (!entity || this.getMapId() !== entity.getMapId()) {
          return false;
      }
      return this.canSeeCoord(entity.getX(),entity.getY());
  },
  canSeeCoord: function(x_or_pos,y) {
    var otherX = x_or_pos,otherY=y;
    if (typeof x_or_pos == 'object') {
      otherX = x_or_pos.x;
      otherY = x_or_pos.y;
    }

    // If we're not within the sight radius, then we won't be in a real field of view either.
    if (Math.max(Math.abs(otherX - this.getX()),Math.abs(otherY - this.getY())) > this.attr._Sight_attr.sightRadius) {
      return false;
    }

    var inFov = this.getVisibleCells();
    return inFov[otherX+','+otherY] || false;
  },
  getVisibleCells: function() {
      var visibleCells = {'byDistance':{}};
      for (var i=0;i<=this.getSightRadius();i++) {
          visibleCells.byDistance[i] = {};
      }
      this.getMap().getFov().compute(
          this.getX(), this.getY(),
          this.getSightRadius(),
          function(x, y, radius, visibility) {
              visibleCells[x+','+y] = true;
              visibleCells.byDistance[radius][x+','+y] = true;
          }
      );
      return visibleCells;
  },
  canSeeCoord_delta: function(dx,dy) {
      return this.canSeeCoord(this.getX()+dx,this.getY()+dy);
  }
};


Game.EntityMixin.MapMemory = {
  META: {
    mixinName: 'MapMemory',
    mixinGroup: 'MapMemory',
    stateNamespace: '_MapMemory_attr',
    stateModel:  {
      mapsHash: {}
    },
    init: function (template) {
      this.attr._MapMemory_attr.mapsHash = template.mapsHash || {};
    }
  },
  rememberCoords: function (coordSet,mapId) {
    var mapKey=mapId || this.getMapId();
    if (! this.attr._MapMemory_attr.mapsHash[mapKey]) {
      this.attr._MapMemory_attr.mapsHash[mapKey] = {};
    }
    for (var coord in coordSet) {
      if (coordSet.hasOwnProperty(coord) && (coord != 'byDistance')) {
        this.attr._MapMemory_attr.mapsHash[mapKey][coord] = true;
      }
    }
  },
  getRememberedCoordsForMap: function (mapId) {
    var mapKey=mapId || this.getMapId();
    return this.attr._MapMemory_attr.mapsHash[mapKey] || {};
  }
};
