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
      if(this.canMove()) {
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
            this.raiseEntityEvent('adjacentMove', {dx:dx, dy:dy});
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
  canMove: function () {
    return this.attr._PlayerActor_attr.canMove;
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
    mixinGroup: 'Walker',
    listeners: {
      'adjacentMove': function(evtData) {
          var map = this.getMap();
          var dx=evtData.dx,dy=evtData.dy;
          var targetX = Math.min(Math.max(0,this.getX() + dx),map.getWidth()-1);
          var targetY = Math.min(Math.max(0,this.getY() + dy),map.getHeight()-1);
          if (map.getEntity(targetX,targetY)) { // can't walk into spaces occupied by other entities
            this.raiseEntityEvent('bumpEntity',{actor:this,recipient:map.getEntity(targetX,targetY)});
            // NOTE: should bumping an entity always take a turn? might have to get some return data from the event (once event return data is implemented)
            return {madeAdjacentMove:false};
          }
          var targetTile = map.getTile(targetX,targetY);
          if (targetTile.isWalkable()) {
            this.setPos(targetX,targetY);
            var myMap = this.getMap();
            if (myMap) {
              myMap.updateEntityLocation(this);
            }
            this.raiseEntityEvent('movedUnit',{direction:Game.util.posToDir(dx,dy)});
            return {madeAdjacentMove:true};
          } else {
            this.raiseEntityEvent('walkForbidden',{target:targetTile});
          }
          return {madeAdjacentMove:false};
          }
        }
      }
};

Game.EntityMixin.TailSegment = {
  META: {
    mixinName: 'TailSegment',
    mixinGroup: 'Child',
    stateNamespace: '_TailSegment_attr',
    stateModel: {
      headSegment: null
    },
    init: function(template) {
      this.attr._TailSegment_attr.headSegment = template.headSegment;
    }
  },
  raiseEntityEvent: function(evtLabel, evtData) {
    this.attr._TailSegment_attr.headSegment.raiseEntityEvent.call(this.getHeadSegment(), evtLabel, evtData);
  },
  getHeadSegment: function() {
    return this.attr._TailSegment_attr.headSegment;
  }
};

Game.EntityMixin.WalkerSegmented = {
  META: {
    mixinName: 'WalkerSegmented',
    mixinGroup: 'Walker',
    stateNamespace: '_WalkerSegmented_attr',
    stateModel: {
      tailSegment: null,
      extChar: ['7','8','9','0'],
      baseChar: '%',
      extended: false
    },
    init: function(template) {
      this.attr._WalkerSegmented_attr.headChar = template.extChar || ['a','b','c','d'];
      this.attr._WalkerSegmented_attr.baseChar = template.chr;
      this.attr._WalkerSegmented_attr.tailSegment = new Game.Entity({name:this.getName() + ' Tail Segment', chr:this.attr._WalkerSegmented_attr.extChar[0], headSegment:this, mixins:['TailSegment']});
    },
    listeners: {
      'adjacentMove': function(evtData) {
        if(!this.isExtended()) {
            var map = this.getMap();
            var dx=evtData.dx,dy=evtData.dy;
            var targetX = Math.min(Math.max(0,this.getX() + dx),map.getWidth()-1);
            var targetY = Math.min(Math.max(0,this.getY() + dy),map.getHeight()-1);
            if (map.getEntity(targetX,targetY)) { // can't walk into spaces occupied by other entities
              this.raiseEntityEvent('bumpEntity',{actor:this,recipient:map.getEntity(targetX,targetY)});
              // NOTE: should bumping an entity always take a turn? might have to get some return data from the event (once event return data is implemented)
              return {madeAdjacentMove:false};
            }
            var targetTile = map.getTile(targetX,targetY);
            if (targetTile.isWalkable()) {
              this.setPos(targetX,targetY);
              var myMap = this.getMap();
              if (myMap) {
                myMap.updateEntityLocation(this);
              }
              this.extend({x:dx,y:dy});
              this.raiseEntityEvent('movedUnit',{direction:Game.util.posToDir(dx,dy)});
              return {madeAdjacentMove:true};
            } else {
              this.raiseEntityEvent('walkForbidden',{target:targetTile});
            }
            return {madeAdjacentMove:false};
          }
          else {
            this.contract();
            return {madeAdjacentMove:true};
          }
        },
        'killed': function(evtData) {
          this.getTailSegment().destroy();
        }
      }
    },
    getTailSegment: function() {
      return this.attr._WalkerSegmented_attr.tailSegment;
    },
    setTailSegment: function(seg) {
      this.attr._WalkerSegmented_attr.tailSegment = seg;
    },
    isExtended: function() {
      return this.attr._WalkerSegmented_attr.extended;
    },
    extend: function(pos) {
      var dir = Game.util.posToDir(pos);
      this.attr._WalkerSegmented_attr.extended = true;
      this.setChar(this.attr._WalkerSegmented_attr.extChar[dir/2]);
      this.getTailSegment().setChar(this.attr._WalkerSegmented_attr.extChar[((dir/2) + 2) % 4]);
      this.getMap().addEntity(this.getTailSegment(),{x:this.getX() - pos.x, y:this.getY() - pos.y});
    },
    contract: function() {
      this.getMap().extractEntity(this.getTailSegment());
      this.attr._WalkerSegmented_attr.extended = false;
      this.setChar(this.attr._WalkerSegmented_attr.baseChar);
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
      if (this.canMove()) { // NOTE: this pattern suggests that maybe tryWalk shoudl be converted to an event
        if(this.raiseEntityEvent('adjacentMove', {dx:moveDeltas.x, dy:moveDeltas.y}).madeAdjacentMove[0]) {
          this.setMovable(false);
          setTimeout(function() {curObj.setMovable(true);}, 750);
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
    return Game.util.positionsOrthogonalTo({x:0,y:0}).random();
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
        this.getMap().addEntity(projectile, {x:this.getX() + projectile.getDirection().x, y:this.getY() + projectile.getDirection().y});
        projectile.attr._Bullet_attr.firedBy = this;
        setTimeout(function() {projectile.act();}, projectile.getSpeed());
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
        if(!this.raiseEntityEvent('adjacentMove', {dx:this.getDirection().x, dy:this.getDirection().y}).madeAdjacentMove[0]) {
          this.destroy();
        } else {
          var curObj = this;
          this.attr._timeout = setTimeout(function () {curObj.act();}, this.getSpeed());
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

Game.EntityMixin.NarrowSight = {
  META: {
    mixinName: 'NarrowSight',
    mixinGroup: 'Sense',
    stateNamespace: '_NarrowSight_attr',
    stateModel: {
      sightRadius: 10,
      facing: 0
    },
    init: function (template) {
      this.attr._NarrowSight_attr.sightRadius = template.sightRadius || 10;
    },
    listeners: {
      'movedUnit': function(evtData) {
        this.setFacing(evtData.direction);
      }
    }
  },
  getSightRadius: function () {
    return this.attr._NarrowSight_attr.sightRadius;
  },
  setSightRadius: function (n) {
    this.attr._NarrowSight_attr.sightRadius = n;
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
    if (Math.max(Math.abs(otherX - this.getX()),Math.abs(otherY - this.getY())) > this.attr._NarrowSight_attr.sightRadius) {
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
      this.getMap().getFov().compute90(
          this.getX(), this.getY(),
          this.getSightRadius(), this.getFacing(),
          function(x, y, radius, visibility) {
              visibleCells[x+','+y] = true;
              visibleCells.byDistance[radius][x+','+y] = true;
          }
      );
      return visibleCells;
  },
  canSeeCoord_delta: function(dx,dy) {
      return this.canSeeCoord(this.getX()+dx,this.getY()+dy);
  },
  getFacing: function () {
    return this.attr._NarrowSight_attr.facing;
  },
  setFacing: function (dir) {
    this.attr._NarrowSight_attr.facing = dir;
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
    var mapKey=mapId || this.getMap().getId();
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
    var mapKey=mapId || this.getMap().getId();
    return this.attr._MapMemory_attr.mapsHash[mapKey] || {};
  }
};
