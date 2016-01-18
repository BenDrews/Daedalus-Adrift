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
      },

       'noItemsToPickup': function(evtData) {
         Game.Message.send('there is nothing to pickup');
         Game.renderDisplayMessage();
       },
       'inventoryFull': function(evtData) {
         Game.Message.send('your inventory is full');
         Game.renderDisplayMessage();
       },
       'inventoryEmpty': function(evtData) {
         Game.Message.send('you are not carrying anything');
         Game.renderDisplayMessage();
       },
       'noItemsPickedUp': function(evtData) {
         Game.Message.send('you could not pick up any items');
         Game.renderDisplayMessage();
       },
       'someItemsPickedUp': function(evtData) {
         Game.Message.send('you picked up '+evtData.numItemsPickedUp+' of the items, leaving '+evtData.numItemsNotPickedUp+' of them');
         Game.renderDisplayMessage();
       },
       'allItemsPickedUp': function(evtData) {
        if (evtData.numItemsPickedUp > 1) {
           Game.Message.send('you picked up all '+evtData.numItemsPickedUp+' items');
         } else {
           Game.Message.send('you picked up the item');
         }
         Game.renderDisplayMessage();
       },
       'itemsDropped': function(evtData) {
         Game.Message.send('you dropped '+evtData.numItemsDropped+' items');
         Game.renderDisplayMessage();
       }
    }
  }
};

Game.EntityMixin.InventoryHolder = {
  META: {
    mixinName: 'InventoryHolder',
    mixinGroup: 'InventoryHolder',
    stateNamespace: '_InventoryHolder_attr',
    stateModel:  {
      containerId: '',
      inventoryCapacity: 5
    },
    init: function (template) {
      this.attr._InventoryHolder_attr.inventoryCapacity = template.inventoryCapacity || 5;
      if (template.containerId) {
        this.attr._InventoryHolder_attr.containerId = template.containerId;
      } else {
        var container = Game.ItemGenerator.create('_inventoryContainer');
        container.setCapacity(this.attr._InventoryHolder_attr.inventoryCapacity);
        this.attr._InventoryHolder_attr.containerId = container.getId();
      }
    },
    listeners: {
      'pickupItems': function(evtData) {
        return {addedAnyItems: this.pickupItems(evtData.itemSet)};
      },
      'dropItems': function(evtData) {
        return {droppedItems: this.dropItems(evtData.itemSet)};
      }
    }
  },
  _getContainer: function() {
    return Game.DATASTORE.ITEM[this.attr._InventoryHolder_attr.containerId];
  },
  hasSpace: function () {
    return this._getContainer().hasSpace();
  },
  addItems: function (items_or_ids) {
    return this._getContainer().addItems(items_or_ids);
  },
  getItemIds: function () {
    return this._getContainer().getItemIds();
  },
  extractItems: function (ids_or_idxs) {
    return this._getContainer().extractItems(ids_or_idxs);
  },
  pickupItems: function (ids_or_idxs) {
    var itemsToAdd = [];
    var fromPile = this.getMap().getItems(this.getPos());
    var pickupResult = {
      numItemsPickedUp: 0,
      numItemsNotPickedUp: ids_or_idxs.length
    };

    if (fromPile.length < 1) {
      this.raiseSymbolActiveEvent('noItemsToPickup');
      return pickupResult;
    }
    if (! this._getContainer().hasSpace()) {
      this.raiseSymbolActiveEvent('inventoryFull');
      this.raiseSymbolActiveEvent('noItemsPickedUp');
      return pickupResult;
    }
    for (var i = 0; i < fromPile.length; i++) {
      if ((ids_or_idxs.indexOf(i) > -1) || (ids_or_idxs.indexOf(fromPile[i].getId()) > -1)) {
        itemsToAdd.push(fromPile[i]);
      }
    }
    var addResult = this._getContainer().addItems(itemsToAdd);
    pickupResult.numItemsPickedUp = addResult.numItemsAdded;
    pickupResult.numItemsNotPickedUp = add.Result.numItemsNotAdded;
    for (var j = 0; j < pickupResult.numItemsPickedUp; j++) {
      this.getMap().extractItemAt(itemsToAdd[j],this.getPos());
    }
    if (pickupResult.numItemsNotPickedUp > 0) {
      this.raiseSymbolActiveEvent('someItemsPickedUp', pickupResult);
    } else {
      this.raiseSymbolActiveEvent('allItemsPickedUp', pickupResult);
    }
    return pickupResult;
  },
  dropItems: function (ids_or_idxs) {
    var itemIdsToDrop = this._getContainer().extractItems(ids_or_idxs);
    var dropResult = {numItemsDropped: 0};
    if (itemIdsToDrop.length < 1) {
      this.raiseSymbolActiveEvent('inventoryEmpty');
      return dropResult;
    }

    for (var i = 0; i < itemToDrop.length; i++) {
      if (itemToDrop[i]) {
        this.getMap().addItem(itemsToDrop[i],this.getPos());
        dropResult.numItemsDropped++;
      }
    }
    this.raiseSymbolActiveEvent('itemsDropped', dropResult);
    return dropResult;
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
      curEntity.raiseSymbolActiveEvent('actionDone');
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
      this.raiseSymbolActiveEvent('bumpEntity',{actor:this,recipient:map.getEntity(targetX,targetY)});
      return false;
    }
    var targetTile = map.getTile(targetX,targetY);
    if (targetTile.isWalkable()) {
      this.setPos(targetX,targetY);
      var myMap = this.getMap();
      if (myMap){
        if ((dx !== 0) || (dy !== 0)) {
          this.raiseSymbolActiveEvent('movedUnit',{direction: Game.util.posToDir(dx,dy)});
          myMap.updateEntityLocation(this);
        }
      }
      return true;
    }
    this.raiseSymbolActiveEvent('walkForbidden',{target:targetTile});
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
        this.raiseSymbolActiveEvent('damagedBy',{damager:evtData.attacker,damageAmount:evtData.attackPower});
        evtData.attacker.raiseSymbolActiveEvent('dealtDamage',{damagee:this,damageAmount:evtData.attackPower});
        if (this.getCurHp() <= 0) {
          this.raiseSymbolActiveEvent('killed',{entKilled: this, killedBy: evtData.attacker});
          evtData.attacker.raiseSymbolActiveEvent('madeKill',{entKilled: this, killedBy: evtData.attacker});
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
        if(this.tryWalk(Game.UIMode.gamePlay.getMap(), moveDeltas.x, moveDeltas.y)) {
          this.setMovable(false);
          setTimeout(function() {curObj.setMovable(true);}, 150);
        }
      }
      this.setCurrentActionDuration(this.getBaseActionDuration());
      this.raiseSymbolActiveEvent('actionDone');
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
        evtData.recipient.raiseSymbolActiveEvent('attacked',{attacker:evtData.actor,attackPower:this.getAttackPower()});
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

      this.raiseSymbolActiveEvent('actionDone');

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
        evtData.recipient.raiseSymbolActiveEvent('attacked',{attacker:evtData.actor.attr._Bullet_attr.firedBy,attackPower:this.getAttackPower()});
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
