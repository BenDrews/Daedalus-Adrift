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
    priority: 1,
    act: function () {
      curEntity = this;
      if(curEntity.attr._PlayerActor_attr.canMove && curEntity.hasMixin('Walker')) {
          var dx = 0;
          var dy = 0;
          if(curEntity.attr._PlayerActor_attr.direction & 1) {
            dy--;
          }
          if(curEntity.attr._PlayerActor_attr.direction & 2) {
            dx++;
          }
          if(curEntity.attr._PlayerActor_attr.direction & 4) {
            dy++;
          }
          if(curEntity.attr._PlayerActor_attr.direction & 8) {
            dx--;
          }
          if(dx !== 0 || dy !== 0) {
            Game.UIMode.gamePlay.moveAvatar(dx,dy);
            curEntity.setMovable(false);
            if(Math.abs(dx) + Math.abs(dy) == 2) {
              setTimeout(function () {curEntity.setMovable(true);},75 * Math.sqrt(2));
            } else {
              setTimeout(function () {curEntity.setMovable(true);},75);
            }
          }
      }
      curEntity.raiseEntityEvent('actionDone');
      curEntity.attr._timeout = setTimeout(function() {curEntity.act();}, 50);
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
        Game.switchUIMode('gameLose');
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
      timeout: null,
      canMove: true
    },
    priority: 1,
    act: function () {
      var moveDeltas = this.getMoveDeltas();
      var curObj = this;
      if (this.hasMixin('Walker') && this.canMove()) { // NOTE: this pattern suggests that maybe tryWalk shoudl be converted to an event
        console.log('Try walking');
        if(this.tryWalk(Game.UIMode.gamePlay.getMap(), moveDeltas.x, moveDeltas.y)) {
          console.log('Moving');
          this.setMovable(false);
          setTimeout(function() {curObj.setMovable(true);}, 150);
        }
      }
      this.setCurrentActionDuration(this.getBaseActionDuration());
      this.raiseEntityEvent('actionDone');
      clearTimeout(curObj.attr._timeout);
      curObj.attr._timeout = setTimeout(function() {curObj.act();}, 75);
    },
    init: function (template) {
    }
  },
  canMove: function () {
    return this.attr._WanderActor_attr.canMove;
  },
  setMovable: function (canMove) {
    this.attr._WanderActor_attr.canMove = canMove;
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
        console.log('MeleeAttacker bumpEntity' + evtData.actor.attr._name + " " + evtData.recipient.attr._name);
        evtData.recipient.raiseEntityEvent('attacked',{attacker:evtData.actor,attackPower:this.getAttackPower()});
      }
    }
  },
  getAttackPower: function () {
    return this.attr._MeleeAttacker_attr.attackPower;
  }
};

Game.EntityMixin.ShooterActor = {
  META: {
    mixinName: 'ShooterActor',
    mixinGroup: 'Actor',
    stateNamespace: '_ShooterActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000,
      timeout: null,
      integer: 0,
      canAttack: true
    },
    act: function () {
      var curObj = this;
      if (this.canAttack()) {
        var projectile = Game.EntityGenerator.create('projectile');
        projectile.setDirection(this.getProjectileDeltas());
        Game.UIMode.gamePlay.getMap().addEntity(projectile, this.getPos());
        projectile.attr._Bullet_attr.firedBy = this;
        projectile.act();
        this.setAttack(false);
        setTimeout(function() {curObj.setAttack(true);}, 1000);
      }

      this.raiseEntityEvent('actionDone');

      clearTimeout(curObj.attr._timeout);
      curObj.attr._timeout = setTimeout(function() {curObj.act();}, 50);
    }
  },
  canAttack: function () {
    return this.attr._ShooterActor_attr.canAttack;
  },
  setAttack: function (canAttack) {
    this.attr._ShooterActor_attr.canAttack = canAttack;
  },
  getProjectileDeltas: function () {
    return Game.util.positionsAdjacentTo({x:0,y:0}).random();
  },
};

Game.EntityMixin.Bullet = {
  META: {
    mixinName: 'Bullet',
    mixinGroup: 'Projectile',
    stateNamespace: '_Bullet_attr',
    stateModel:  {
      attackPower: 1,
      firedBy: null,
      direction: null,
      speed: 100
    },
    init: function (template) {
      this.attr._Bullet_attr.attackPower = template.attackPower || 1;
      this.attr._Bullet_attr.direction = template.direction || {x:1, y:0};
      this.attr._Bullet_attr.speed = template.speed || 100;
      if(Math.abs(this.getDirection().x) + Math.abs(this.getDirection().y) === 2) {
        this.attr._Bullet_attr.speed *= Math.sqrt(2);
      }
    },
    listeners: {
      'bumpEntity': function(evtData) {
        if (this.attr._Bullet_attr.firedBy!== evtData.recipient) {
        console.log('Projectile bumpEntity' + evtData.actor.attr._name + " " + evtData.recipient.attr._name);
        evtData.recipient.raiseEntityEvent('attacked',{attacker:evtData.actor.attr._Bullet_attr.firedBy,attackPower:this.getAttackPower()});
        this.destroy();
        }
      }
    },
    priority: 1,
    act: function () {
      if(this.hasMixin('Walker')) {
        if(!this.tryWalk(Game.UIMode.gamePlay.getMap(), this.getDirection().x, this.getDirection().y)) {
          this.destroy();
        } else {
          var curObj = this;
          this.attr._timeout = setTimeout(function () {curObj.act();}, this.getSpeed());
        }
      }
    }
  },
  getDirection: function() {
    return this.attr._Bullet_attr.direction;
  },
  setDirection: function(direction) {
    this.attr._Bullet_attr.direction = direction;
  },
  getSpeed: function() {
    return this.attr._Bullet_attr.speed;
  },
  setSpeed: function (speed) {
    this.attr._Bullet_attr.speed = speed;
  },
  getAttackPower: function () {
    return this.attr._Bullet_attr.attackPower;
  }
};
