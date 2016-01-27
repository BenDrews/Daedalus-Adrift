Game.EntityMixin = {};

Game.EntityMixin.PlayerMessager = {
  META: {
    mixinName: 'PlayerMessager',
    mixinGroup: 'PlayerMessager',
    listeners: {
      'walkForbidden': function(evtData) {
        Game.Message.send('Your path is blocked.');
      },
      'dealtDamage': function(evtData) {
        evtData.attackMethod = evtData.attackMethod || 'hit';
        Game.Message.send('You ' + evtData.attackMethod + ' the '+evtData.damagee.getName()+' dealing '+evtData.damageAmount + ' damage.');
      },
      'madeKill': function(evtData) {
        Game.Message.send('You killed the '+evtData.entKilled.getName() + '.');
      },
      'damagedBy': function(evtData) {
        evtData.attackMethod = evtData.attackMethod || 'hit';
        Game.Message.send('The '+evtData.damager.getName()+' ' + evtData.attackMethod + ' you dealing '+evtData.damageAmount + ' damage.');
      },
      'afflictedWith': function(evtData){
        Game.Message.send('The '+evtData.afflicter.getName() + ' has '+evtData.afflictionMessage + ' afflicting you with ' + evtData.affliction +'.');
      },
      'afflictionRemoved': function(evtData) {
        Game.Message.send('You have been ' + evtData.cureMessage + ' curing your ' + evtData.affliction + '.');
      },
      'warning': function(evtData) {
        Game.Message.send(evtData.warning);
      },
      'killed': function(evtData) {
        Game.Message.send('You were killed by the '+evtData.killedBy.getName() + '.');
      },

      'noItemsToPickup': function(evtData) {
        Game.Message.send('there is nothing to pickup');
        Game.renderMessage();
      },
      'inventoryFull': function(evtData) {
        Game.Message.send('your inventory is full');
        Game.renderMessage();
      },
      'inventoryEmpty': function(evtData) {
        Game.Message.send('you are not carrying anything');
        Game.renderMessage();
      },
      'noItemsPickedUp': function(evtData) {
        Game.Message.send('you could not pick up any items');
        Game.renderMessage();
      },
      'someItemsPickedUp': function(evtData) {
        Game.Message.send('you picked up '+evtData.numItemsPickedUp+' of the items, leaving '+evtData.numItemsNotPickedUp+' of them');
        Game.renderMessage();
      },
      'allItemsPickedUp': function(evtData) {
        if (evtData.numItemsPickedUp > 1) {
          Game.Message.send('you picked up all '+evtData.numItemsPickedUp+' items');
        } else {
          Game.Message.send('you picked up the item');
        }
        Game.renderMessage();
      },
      'itemsDropped': function(evtData) {
        Game.Message.send('you dropped '+evtData.numItemsDropped+' items');
        Game.renderMessage();
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
      inventoryCapacity: 5,
      activeItem: null
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
  _getContainer: function () {
    return Game.DATASTORE.ITEM[this.attr._InventoryHolder_attr.containerId];
  },
  hasInventorySpace: function () {
    return this._getContainer().hasSpace();
  },
  addInventoryItems: function (items_or_ids) {
    return this._getContainer().addItems(items_or_ids);
  },
  getInventoryItemIds: function () {
    return this._getContainer().getItemIds();
  },
  extractInventoryItems: function (ids_or_idxs) {
    return this._getContainer().extractItems(ids_or_idxs);
  },
  setActiveItem: function (item) {
    this.attr._InventoryHolder_attr.activeItem = item;
  },
  getActiveItem: function () {
    return this.attr._InventoryHolder_attr.activeItem;
  },
  useActiveItem: function () {
    var foodItem;
    if (this.attr._InventoryHolder_attr.activeItem !== null) {
      if (this.attr._InventoryHolder_attr.activeItem.getDescription() === 'it delatches slimes') {
        if (Game.getAvatar().getCurFood() >= 200) {
          foodItem = this.attr._InventoryHolder_attr.activeItem;
          if (Game.getAvatar().attr._LatchExploder_attr) {
            var latchers = Game.getAvatar().attr._LatchExploder_attr.latchers;
            for (var i = 0; i < latchers.length; i++) {
              latchers[i].raiseEntityEvent('detach');
            }
          }
          Game.UIMode.gamePlay.getAvatar().eatFood(foodItem.getFoodValue());
        } else {
          Game.Message.send("Not enough energy to perform this action.");
        }

      } else if (this.attr._InventoryHolder_attr.activeItem.getDescription() === 'it repairs engines') {
        var facing = this.attr._Sight_attr.facing;
        var numberX, numberY;
        if (facing == 0) {
          numberX = 0;
          numberY = 1;
        } else if (facing == 1) {
          numberX = 1;
          numberY = 1;
        } else if (facing == 2) {
          numberX = 1;
          numberY = 0;
        } else if (facing == 3) {
          numberX = 1;
          numberY = -1;
        } else if (facing == 4) {
          numberX = 0;
          numberY = -1;
        } else if (facing == 5) {
          numberX = -1;
          numberY = -1;
        } else if (facing == 6) {
          numberX = -1;
          numberY = 0;
        } else if (facing == 7) {
          numberX = -1;
          numberY = 1;
        }
        console.log (Game.getAvatar().getX() + numberX, Game.getAvatar().getY() + numberY);
        var entity = this.getMap().getTileEntity(Game.getAvatar().getX() +numberX, Game.getAvatar().getY() +numberY);
        console.log(entity);
        console.log("something");
        if (entity) {
          var someEntity = Game.DATASTORE.ENTITY[entity]
            console.log(someEntity.getName());
        if (someEntity.getName() == 'Engine Leak') {
            foodItem = Game.UIMode.gamePlay.getAvatar().extractInventoryItems([this.attr._InventoryHolder_attr.activeItem.getId()])[0];
            Game.UIMode.gamePlay.getAvatar().eatFood(foodItem.getFoodValue());
            someEntity.destroy();
            this.attr._InventoryHolder_attr.activeItem = null;
        }
      }
      } else {
        if (foodItem.getName() === 'battery') {
          this.attr._InventoryHolder_attr.activeItem = null;
        }
        foodItem = Game.UIMode.gamePlay.getAvatar().extractInventoryItems([this.attr._InventoryHolder_attr.activeItem.getId()])[0];
        Game.UIMode.gamePlay.getAvatar().eatFood(foodItem.getFoodValue());
      }

      //        Game.util.cdebug(foodItem);



    }
  },
  pickupItems: function (ids_or_idxs) {
    var itemsToAdd = [];
    var fromPile = Game.UIMode.gamePlay.getMap().getItems(this.getPos());
    var pickupResult = {
      numItemsPickedUp:0,
      numItemsNotPickedUp:ids_or_idxs.length
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
    pickupResult.numItemsNotPickedUp = addResult.numItemsNotAdded;
    var lastItemFromMap = '';
    for (var j = 0; j < pickupResult.numItemsPickedUp; j++) {
      lastItemFromMap = this.getMap().extractItemAt(itemsToAdd[j],this.getPos());
    }
    console.log(lastItemFromMap);

    pickupResult.lastItemPickedUpName = lastItemFromMap.getName();
    if (pickupResult.numItemsNotPickedUp > 0) {
      this.raiseSymbolActiveEvent('someItemsPickedUp',pickupResult);
    } else {
      this.raiseSymbolActiveEvent('allItemsPickedUp',pickupResult);
    }

    return pickupResult;
  },
  dropItems: function (ids_or_idxs) {
    var itemsToDrop = this._getContainer().extractItems(ids_or_idxs);
    var dropResult = {numItemsDropped:0};
    if (itemsToDrop.length < 1) {
      this.raiseSymbolActiveEvent('inventoryEmpty');
      return dropResult;
    }
    var lastItemDropped = '';
    for (var i = 0; i < itemsToDrop.length; i++) {
      if (itemsToDrop[i]) {
        lastItemDropped = itemsToDrop[i];
        this.getMap().addItem(itemsToDrop[i],this.getPos());
        dropResult.numItemsDropped++;
      }
    }
    dropResult.lastItemDroppedName = lastItemDropped.getName();
    this.raiseSymbolActiveEvent('itemsDropped',dropResult);
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
      canMove: true,
      moveSpeed: 75
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
          setTimeout(function() {curEntity.setMovable(true);}, this.getMoveSpeed() * Math.sqrt(Math.abs(dx) + Math.abs(dy)));
        }
      }
      curEntity.raiseSymbolActiveEvent('actionDone');
      curEntity.attr._timeout = setTimeout(function() {curEntity.act();}, 50);
    },
    init: function (template) {
      this.attr._PlayerActor_attr.moveSpeed = template.moveSpeed || 75;
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
  unsetAllDirections: function () {
    this.attr._PlayerActor_attr.direction = 0;
  },
  getMoveSpeed: function () {
    return this.attr._PlayerActor_attr.moveSpeed;
  },
  setMoveSpeed: function (ms) {
    this.attr._PlayerActor_attr.moveSpeed = ms;
  }
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
        if (map.getEntity(targetX,targetY) && (!evtData.entIgnore || !evtData.entIgnore[map.getEntity(targetX,targetY).getId()])) { // can't walk into spaces occupied by other entities
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
        this.raiseEntityEvent('movedUnit',{dx:dx, dy:dy, direction:Game.util.posToDir(dx,dy)});
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
      extended: false,
      immobilized: false
    },
    init: function(template) {
      this.attr._WalkerSegmented_attr.headChar = template.extChar || ['a','b','c','d'];
      this.attr._WalkerSegmented_attr.baseChar = template.chr;
      this.attr._WalkerSegmented_attr.tailSegment = new Game.Entity({name:this.getName() + ' Tail Segment', chr:this.attr._WalkerSegmented_attr.extChar[0], headSegment:this, alligence:this.getAlligence(), mixins:['TailSegment']});
    },
    listeners: {
      'adjacentMove': function(evtData) {
        if(!this.isImmobile()){
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
            this.raiseEntityEvent('movedUnit',{dx:dx, dy:dy, direction:Game.util.posToDir(dx,dy)});
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
      } else {
        if(this.isExtended()){
          this.contract();
        }
        return {madeAdjacentMove:false};
      }
    },
    'killed': function(evtData) {
      this.getTailSegment().destroy();
    },
    'immobilized': function(evtData) {
      this.setImmobile(evtData.immobilized);
    }
  }
},
setImmobile: function(im) {
  this.attr._WalkerSegmented_attr.immobilized = im;
  if(im) {
    this.contract();
  }
},
isImmobile: function() {
  return this.attr._WalkerSegmented_attr.immobilized;
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
        this.raiseEntityEvent('damagedBy',{damager:evtData.attacker,damageAmount:evtData.attackPower,attackMethod:evtData.attackMethod});
        evtData.attacker.raiseEntityEvent('dealtDamage',{damagee:this,damageAmount:evtData.attackPower,attackMethod:evtData.attackMethod});
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
      if (this.canMove()) { // NOTE: this pattern suggests that maybe tryWalk shoudl be converted to an event
        if(this.raiseEntityEvent('adjacentMove', {dx:moveDeltas.x, dy:moveDeltas.y}).madeAdjacentMove[0]) {
          this.setMovable(false);
          setTimeout(function() {curObj.setMovable(true);}, 250);
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

Game.EntityMixin.WanderChaserActor = {
  META: {
    mixinName: 'WanderChaserActor',
    mixinGroup: 'Actor',
    stateNamespace: '_WanderChaserActor_attr',
    stateModel:  {
      topology: 8,
      speed: 100,
      canMove:true
    },
    priority: 1,
    act: function () {
      var moveDeltas = this.getMoveDeltas();
      var curObj = this;
      if (this.canMove()) { // NOTE: this pattern suggests that maybe tryWalk shoudl be converted to an event
        if(this.raiseEntityEvent('adjacentMove', {dx:moveDeltas.x, dy:moveDeltas.y}).madeAdjacentMove[0]) {
          this.setMovable(false);
          setTimeout(function() {curObj.setMovable(true);}, this.getMoveSpeed()*Math.sqrt(Math.abs(moveDeltas.x) + Math.abs(moveDeltas.y)));
        }
      }
      this.raiseEntityEvent('actionDone');
      clearTimeout(curObj.attr._timeout);
      curObj.attr._timeout = setTimeout(function() {curObj.act();}, 75);
    },
    init: function (template) {
      this.attr._WanderChaserActor_attr.topology = template.topology || 8;
      this.attr._WanderChaserActor_attr.speed = template.speed || 100;
    }
  },
  getMoveSpeed: function () {
    return this.attr._WanderChaserActor_attr.speed;
  },
  setMoveSpeed: function (speed) {
    this.attr._WanderChaserActor_attr.speed = speed;
  },
  getMoveDeltas: function () {
    var avatar = Game.getAvatar();
    var senseResp = this.raiseEntityEvent('senseForEntity',{senseForEntity:avatar});
    if (Game.util.compactBooleanArray_or(senseResp.entitySensed)) {

      // build a path instance for the avatar
      var source = this;
      var map = this.getMap();
      var path = new ROT.Path.AStar(avatar.getX(), avatar.getY(), function(x, y) {
        // If an entity is present at the tile, can't move there.
        var entity = map.getEntity(x, y);
        if (entity && entity !== avatar && entity !== source) {
          return false;
        }
        return map.getTile(x, y).isWalkable();
      }, {topology: this.attr._WanderChaserActor_attr.topology});

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
      if(moveDeltas.x || moveDeltas.y) {
        return moveDeltas;
      }
    }
    return Game.util.positionsOrthogonalTo({x:0,y:0}).random();
  },
  canMove: function() {
    return this.attr._WanderChaserActor_attr.canMove;
  },
  setMovable: function (canMove) {
    this.attr._WanderChaserActor_attr.canMove = canMove;
  }
};

Game.EntityMixin.Particle = {
  META: {
    mixinName: 'Particle',
    mixinGroup: 'Effect',
    stateNamespace: '_Particle_attr',
    stateModel: {
      duration: 250,
      prevEnt: null
    },
    init: function (template) {
      this.attr._Particle_attr.duration = template.duration || 250;
      this.attr._Particle_attr.prevEnt = template.prevEnt || null;
      var curEnt = this;
      setTimeout(function() {
        var map = curEnt.getMap();
        curEnt.destroy();
        if(curEnt.getPrevEnt()) {
          map.updateEntityLocation(curEnt.getPrevEnt());
        }
      }, curEnt.getDuration());
    }
  },
  getPrevEnt: function () {
    return this.attr._Particle_attr.prevEnt;
  },
  getDuration: function () {
    return this.attr._Particle_attr.duration;
  }
};

Game.EntityMixin.LatchExploder = {
  META: {
    mixinName: 'LatchExploder',
    mixinGroup: 'Attacker',
    stateNamespace: '_LatchExploder_attr',
    stateModel: {
      explosionPower: 1,
      slow: 50,
      attached: false,
      attachedTo: null,
      canAttach: true
    },
    init: function (template) {
      this.attr._LatchExploder_attr.explosionPower = template.explosionPower || 1;
      this.attr._LatchExploder_attr.slow = template.slow || 50;
    },
    listeners: {
      'attacheeMove': function (evtData) {
        var targetX = this.getX() + evtData.dx;
        var targetY = this.getY() + evtData.dy;
        var map = this.getMap();
        if(!evtData.latchers) {
          evtData.latchers = {};
          for(var ltch = 0; ltch < this.getAttachedTo().attr._LatchExploder_attr.latchers.length; ltch++) {
            evtData.latchers[this.getAttachedTo().attr._LatchExploder_attr.latchers[ltch].getId()] = false;
          }
        }
        if(map.getTile(targetX,targetY).isWalkable()) {
          var ent = map.getEntity(targetX,targetY);
          if(!ent || ent == this.getAttachedTo() || (typeof ent.getAttachedTo == 'function' && ent.getAttachedTo() == this.getAttachedTo())) {
            evtData.latchers[this.getId()] = true;
          }
        }
        var allCanMove = true;
        for(var latcher in evtData.latchers) {
          allCanMove = allCanMove && evtData.latchers[latcher];
        }
        if(allCanMove) {
          evtData.handled = false;
          if(!evtData.entIgnore) {evtData.entIgnore = {};}
          for(latcher in evtData.latchers) {
            evtData.entIgnore[latcher] = true;
          }
        } else {
          evtData.handled = true;
          evtData.response = {madeAdjacentMove:[false]};
        }
      },
      'attacheeMoved': function (evtData) {
        this.setPos(this.getX() + evtData.dx, this.getY() + evtData.dy);
        var map = this.getMap();
        for (var ltch = 0; ltch < this.getAttachedTo().attr._LatchExploder_attr.latchers.length; ltch++) {
          if(this.getAttachedTo().attr._LatchExploder_attr.latchers[ltch] != this) {
            map.extractEntity(this.getAttachedTo().attr._LatchExploder_attr.latchers[ltch]);
          }
        }
        this.getMap().updateEntityLocation(this);
        for (ltch = 0; ltch < this.getAttachedTo().attr._LatchExploder_attr.latchers.length; ltch++) {
          if(this.getAttachedTo().attr._LatchExploder_attr.latchers[ltch] != this) {
            map.addEntity(this.getAttachedTo().attr._LatchExploder_attr.latchers[ltch],this.getAttachedTo().attr._LatchExploder_attr.latchers[ltch].getPos());
          }
        }
        map.updateEntityLocation(this.getAttachedTo());
      },
      'primeExplosion': function (evtData) {
        var positions = Game.util.positionsOrthogonalTo(this.getPos());
        if(this.getAttachedTo().attr._LatchExploder_attr.latchers[0] == this) {
          for(var i = 0; i < positions.length; i++) {
            var ent = this.getMap().getEntity(positions[i]);
            if(ent == Game.getAvatar()) {
              ent.raiseEntityEvent('warning', {warning:'The slimes nearby start to contort and pulsate...'});
            }
          }
        }
        if(this.isAttached()) {
          this.detach();
          this.raiseEntityEvent('immobilized', {immobilized:true});
        }
        var curEnt = this;
        setTimeout(function () {curEnt.raiseEntityEvent('explode');}, 1000);
      },
      'explode': function (evtData) {
        var positions = Game.util.positionsOrthogonalTo(this.getPos());
        var map = this.getMap();
        for(var i = 0; i < positions.length; i++) {
        var ent = map.getEntity(positions[i]);
        if(!ent && map.getTile(positions[i]).isWalkable()) {
          map.addEntity(new Game.Entity({chr: '!', mixins: ['Particle']}), positions[i]);
        }
          if(ent && !ent.isAllied(this)) {
            ent.raiseEntityEvent("attacked",{attacker:this,attackPower:this.getExplosionPower(),attackMethod:"violently exploded near"});
          }
        }
        this.destroy();
        var pos= this.getPos();
        map.addEntity(new Game.Entity({chr: '!', mixins: ['Particle']}), pos);
      },
      'detach': function (evtData) {
        if(this.isAttached()) {
          this.detach();
        }
      },
      'killed': function(evtData) {
        if(this.isAttached()){
          this.detach();
        }
        this.destroy();
      }
    },
    act: function () {
      if(this.isAttached() && !Game.DATASTORE.ENTITY[this.getAttachedTo().getId()]) {
        this.raiseEntityEvent('detach');
      }
      if(!this.isAttached() && this.getCanAttach()){
        var map = this.getMap();
        var ent = null;
        var adjPos = Game.util.positionsOrthogonalTo(this.getPos());
        for (var i = 0; i < adjPos.length; i++) {
          ent = map.getEntity(adjPos[i]);
          if(ent && !this.isAllied(ent)) {
            this.attachTo(ent);
          }
        }
      }
    }
  },
  getCanAttach: function() {
    return this.attr._LatchExploder_attr.canAttach;
  },
  setCanAttach: function(ca) {
    this.attr._LatchExploder_attr.canAttach = ca;
  },
  isAttached: function () {
    return this.attr._LatchExploder_attr.attached;
  },
  attachTo: function (ent) {
    this.raiseEntityEvent('immobilized', {immobilized:true});
    this.attr._LatchExploder_attr.attached = true;
    this.attr._LatchExploder_attr.attachedTo = ent;
    if(typeof ent.setMoveSpeed == 'function') {
      ent.setMoveSpeed(ent.getMoveSpeed() + this.getSlow());
    }
    var curEntity = this;
    if(!ent.attr._LatchExploder_attr) {ent.attr._LatchExploder_attr = {};}
    if(!ent.attr._LatchExploder_attr.latchers) {ent.attr._LatchExploder_attr.latchers = [];}
    ent.attr._LatchExploder_attr.latchers.push(this);

    ent.addListener(this, 'adjacentMove', 'attacheeMove');
    ent.addListener(this, 'movedUnit', 'attacheeMoved');
    ent.addListener(this, 'killed', 'detach');

    ent.raiseEntityEvent('afflictedWith',{afflicter:this,affliction:'slow',afflictionMessage:'latched on'});
    if(ent.attr._LatchExploder_attr.latchers.length >= 4) {
      for(var ltch = 0; ltch < 4; ltch++) {
        ent.attr._LatchExploder_attr.latchers[0].raiseEntityEvent('primeExplosion');
      }
    }
  },
  getAttachedTo: function () {
    return this.attr._LatchExploder_attr.attachedTo;
  },
  detach: function () {
    this.raiseEntityEvent('immobilized', {immobilized:false});
    ent = this.getAttachedTo();
    if(ent) {
      if(typeof ent.setMoveSpeed == 'function') {
        ent.setMoveSpeed(ent.getMoveSpeed() - 50);
      }
      ent.removeListener(this);
      ent.raiseEntityEvent('afflictionRemoved',{affliction:'slow', cureMessage:"released by the slime"});
      for(var ltch = 0; ltch < ent.attr._LatchExploder_attr.latchers.length; ltch++) {
          if(ent.attr._LatchExploder_attr.latchers[ltch] == this) {
            ent.attr._LatchExploder_attr.latchers.splice(ltch,1);
          }
      }
    }
    this.attr._LatchExploder_attr.attached = false;
    this.attr._LatchExploder_attr.attachedTo = null;

    this.setCanAttach(false);
    var curEnt = this;
    setTimeout(function() {curEnt.setCanAttach(true);}, 2000);
  },
  getSlow: function () {
    return this.attr._LatchExploder_attr.slow;
  },
  setSlow: function (s) {
    this.attr._LatchExploder_attr.slow = s;
  },
  getExplosionPower: function () {
    return this.attr._LatchExploder_attr.explosionPower;
  },
  setExplosionPower: function(ep) {
    this.attr._LatchExploder_attr.explosionPower = ep;
  }
};

Game.EntityMixin.MeleeAttacker = {
  META: {
    mixinName: 'MeleeAttacker',
    mixinGroup: 'Attacker',
    stateNamespace: '_MeleeAttacker_attr',
    stateModel:  {
      attackPower: 1,
      canAttack: true,
      speed: 100
    },
    init: function (template) {
      this.attr._MeleeAttacker_attr.attackPower = template.attackPower || 1;
      this.attr._MeleeAttacker_attr.speed = template.attackSpeed || 100;
    },
    listeners: {
      'bumpEntity': function(evtData) {
        console.log('MeleeAttacker bumpEntity' + evtData.actor.attr._name + " " + evtData.recipient.attr._name);
        var curObj = this;
        if(!this.isAllied(evtData.recipient) && this.canAttack()) {
          evtData.recipient.raiseEntityEvent('attacked',{attacker:evtData.actor,attackPower:this.getAttackPower()});
          this.setAttack(false);
          setTimeout(function() {curObj.setAttack(true);}, this.getAttackSpeed());
        }
      }
    }
  },
  getAttackSpeed: function () {
    return this.attr._MeleeAttacker_attr.speed;
  },
  setAttackSpeed: function (speed) {
    this.attr._MeleeAttacker_attr.speed = speed;
  },
  canAttack: function () {
    return this.attr._MeleeAttacker_attr.canAttack;
  },
  setAttack: function (canAttack) {
    this.attr._MeleeAttacker_attr.canAttack = canAttack;
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
      timeout: null,
      canAttack: true,
      speed: 500
    },
    init: function (template) {
      this.attr._ShooterActor_attr.speed = template.shootSpeed || 500;
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
        setTimeout(function() {curObj.setAttack(true);}, this.getAttackSpeed());
      }

      this.raiseSymbolActiveEvent('actionDone');

      clearTimeout(curObj.attr._timeout);
      curObj.attr._timeout = setTimeout(function() {curObj.act();}, 50);
    }
  },
  getAttackSpeed: function () {
    return this.attr._ShooterActor_attr.speed;
  },
  setAttackSpeed: function (speed) {
    this.attr._ShooterActor_attr.speed = speed;
  },
  canAttack: function () {
    return this.attr._ShooterActor_attr.canAttack;
  },
  setAttack: function (canAttack) {
    this.attr._ShooterActor_attr.canAttack = canAttack;
  },
  getProjectileDeltas: function () {
    do{
      projDeltas = Game.util.positionsAdjacentTo({x:0,y:0}).random();
    } while(!this.getMap().getTile(this.getX() + projDeltas.x, this.getY() + projDeltas.y).isWalkable());
    return projDeltas;
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

Game.EntityMixin.Sight = {
  META: {
    mixinName: 'Sight',
    mixinGroup: 'Sense',
    stateNamespace: '_Sight_attr',
    stateModel: {
      sightRadius: 10,
      facing: 0,
      sightRange: '360'
    },
    init: function (template) {
      this.attr._Sight_attr.sightRadius = template.sightRadius || 10;
      this.attr._Sight_attr.sightRange = template.sightRange || '360';
    },
    listeners: {
      'movedUnit': function(evtData) {
//        this.setFacing(evtData.direction);
      },
      'senseForEntity': function(evtData) {
        return {entitySensed:this.canSeeEntity(evtData.senseForEntity)};
      }
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
    if (!entity || this.getMap().getId() !== entity.getMap().getId()) {
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
    this.getMap().getFov()['compute'+this.getSightRange()](
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
    return this.attr._Sight_attr.facing;
  },
  setFacing: function () {
   var deltaY = Game.mouseY/2 - 364 / 2 + 70;
   var deltaX = Game.mouseX/2 - 798 / 2 + 90;
   var angle = Math.atan2(deltaY, deltaX);
   console.log( angle, Game.mouseX/2,Game.mouseY/2, 798 /2 - 90, 364 /2 - 70);
   result = Math.round((((angle + Math.PI) / Math.PI)) * 4) + 6;
   console.log(result);
   if (result > 7) {
     result = result - 8;
   }
   this.attr._Sight_attr.facing = result;
 },
  getSightRange: function () {
    return this.attr._Sight_attr.sightRange;
  },
  setSightRange: function (sr) {
    this.attr._Sight_attr.sightRange = sr;
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

Game.EntityMixin.FoodConsumer = {
  META: {
    mixinName: 'FoodConsumer',
    mixinGroup: 'FoodConsumer',
    stateNamespace: '_FoodConsumer_attr',
    stateModel:  {
      currentFood: 2000,
      maxFood: 2000,
      foodConsumedPer1000Ticks: 1
    },
    init: function (template) {
      this.attr._FoodConsumer_attr.maxFood = template.maxFood || 2000;
      this.attr._FoodConsumer_attr.currentFood = template.currentFood || (this.attr._FoodConsumer_attr.maxFood*0.9);
      this.attr._FoodConsumer_attr.foodConsumedPer1000Ticks = template.foodConsumedPer1000Ticks || 1;
    },
    listeners: {
      'getHungrier': function(evtData) {
        this.getHungrierBy(this.attr._FoodConsumer_attr.foodConsumedPer1000Ticks * evtData.duration/1000);
      }
    }
  },
  getMaxFood: function () {
    return this.attr._FoodConsumer_attr.maxFood;
  },
  setMaxFood: function (n) {
    this.attr._FoodConsumer_attr.maxFood = n;
  },
  getCurFood: function () {
    return this.attr._FoodConsumer_attr.currentFood;
  },
  setCurFood: function (n) {
    this.attr._FoodConsumer_attr.currentFood = n;
  },
  getFoodConsumedPer1000: function () {
    return this.attr._FoodConsumer_attr.foodConsumedPer1000Ticks;
  },
  setFoodConsumedPer1000: function (n) {
    this.attr._FoodConsumer_attr.foodConsumedPer1000Ticks = n;
  },
  eatFood: function (foodAmt) {
    this.attr._FoodConsumer_attr.currentFood += foodAmt;
    if (this.attr._FoodConsumer_attr.currentFood > this.attr._FoodConsumer_attr.maxFood) {this.attr._FoodConsumer_attr.currentFood = this.attr._FoodConsumer_attr.maxFood;}
  },
  getHungrierBy: function (foodAmt) {
    this.attr._FoodConsumer_attr.currentFood -= foodAmt;
    if (this.attr._FoodConsumer_attr.currentFood < 0) {
      this.raiseSymbolActiveEvent('killed',{killedBy: 'starvation'});
    }
  },
  getHungerStateDescr: function () {
    var frac = this.attr._FoodConsumer_attr.currentFood/this.attr._FoodConsumer_attr.maxFood;
    if (frac < 0.1) { return 'Energy: %c{#ff2}%b{#f00}*EMPTY*'; }
    if (frac < 0.25) { return 'Energy: %c{#f00}%b{#dd0}low'; }
    if (frac < 0.45) { return 'Energy: %c{#fb0}%b{#540}medium'; }
    if (frac < 0.65) { return 'Energy: %c{#dd0}%b{#000}high'; }
    if (frac < 0.95) { return 'Energy: %c{#090}%b{#000}full'; }
    return '%c{#090}%b{#320}full';
  }
};

Game.EntityMixin.MobSpawner = {
  META: {
    mixinName: 'MobSpawner',
    mixinGroup: 'Spawner',
    stateNamespace: '_MobSpawner_attr',
    stateMode: {
      mob: '',
      canSpawn: true,
      spawnRange: 10,
      savedTile: null,
      rechargeRange: 2000,
      rechargeBase: 5000
    },
    init: function (template) {
      this.attr._MobSpawner_attr.mob = template.mob;
      this.attr._MobSpawner_attr.spawnRange = template.spawnRange || 10;
      this.getSpawnLocation = template.getSpawnLocation || this.getSpawnLocation;
      this.attr._MobSpawner_attr.rechargeBase = template.rechargeBase || 5000;
      this.attr._MobSpawner_attr.rechargeRange = template.rechargeRange || 10000;
      this.attr._MobSpawner_attr.canSpawn = true;
    },
    act: function () {
      var curEnt = this;
        var avatar = Game.getAvatar();
        if(this.canSpawn() && avatar && Math.abs(this.getX() - avatar.getX()) < this.getSpawnRange() && Math.abs(this.getY() - avatar.getY()) < this.getSpawnRange()) {
            var entToSpawn = Game.EntityGenerator.create(this.getMob());
            this.getMap().addEntity(entToSpawn, this.getSpawnLocation());
            if(typeof entToSpawn.act == 'function') {
              entToSpawn.act();
            }
            this.setCanSpawn(false);
            setTimeout(function () {curEnt.setCanSpawn(true);}, curEnt.getSpawnRecharge());
        }
        this.attr._timeout = setTimeout(function () {curEnt.act();}, 1000);
    }
  },
  canSpawn: function () {
    return this.attr._MobSpawner_attr.canSpawn;
  },
  setCanSpawn: function (cspw) {
    this.attr._MobSpawner_attr.canSpawn = cspw;
  },
  getMob: function () {
    return this.attr._MobSpawner_attr.mob;
  },
  setMob: function (mob) {
    this.attr._MobSpawner_attr.mob = mob;
  },
  getSpawnRange: function () {
    return this.attr._MobSpawner_attr.spawnRange;
  },
  setSpawnRange: function (sr) {
    this.attr._MobSpawner_attr.spawnRange = sr;
  },
  getSavedTile: function () {
    return this.attr._MobSpawner_attr.savedTile;
  },
  setSavedTile: function (tile) {
    this.attr._MobSpawner_attr.savedTile = tile;
  },
  getSpawnLocation: function () {
    var spawnPos;
    do{
      spawnPos = Game.util.positionsOrthogonalTo(this.getPos()).random();
    } while(!this.getMap().getTile(spawnPos).isWalkable());
    return spawnPos;
  },
  getSpawnRecharge: function () {
    return this.attr._MobSpawner_attr.rechargeRange + Math.floor(this.attr._MobSpawner_attr.rechargeRange * ROT.RNG.getUniform());
  }
};
