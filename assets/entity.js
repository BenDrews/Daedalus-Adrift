Game.DATASTORE.ENTITY = {};

Game.Entity = function(template) {
    template = template || {};
    this._mixinSet = Game.EntityMixin;
    this.attr = {};
    this.attr._alligence = template.alligence || 'self';
    this.attr._allyHash = template.allyHash || {};
    this.setAlliedWith(this.getAlligence(),true);
    Game.SymbolActive.call(this, template);
    this.attr._x = template.x || 0;
    this.attr._y = template.y || 0;
    this.attr._generator_template_key = template.generator_template_key || '';
    this.attr._mapId = null;
    this.attr._timeout = null;
    this._listeners = {};
    this._listeningTo = [];

    Game.DATASTORE.ENTITY[this.attr._id] = this;
};
Game.Entity.extend(Game.SymbolActive);

Game.Entity.prototype.getMap = function() {
    return Game.DATASTORE.MAP[this.attr._mapId];
};

Game.Entity.prototype.setMap = function(map) {
    this.attr._mapId = map.getId();
};

// Game.Entity.prototype.getName = function() {
//     return this.attr._name;
// };
// Game.Entity.prototype.setName = function(name) {
//     this.attr._name = name;
// };
Game.Entity.prototype.setPos = function(x_or_xy,y) {
  if (typeof x_or_xy == 'object') {
    this.attr._x = x_or_xy.x;
    this.attr._y = x_or_xy.y;
  } else {
    this.attr._x = x_or_xy;
    this.attr._y = y;
  }
};
Game.Entity.prototype.getPos = function() {
  return {x:this.attr._x,y:this.attr._y};
};
Game.Entity.prototype.getX = function() {
    return this.attr._x;
};
Game.Entity.prototype.setX = function(x) {
    this.attr._x = x;
};
Game.Entity.prototype.setY = function(y) {
    this.attr._y = y;
};
Game.Entity.prototype.getY   = function() {
    return this.attr._y;
};

Game.Entity.prototype.act = function() {
  for(var i = 0; i < this._actions.length; i++) {
    this._actions[i].call(this);
  }
};

Game.Entity.prototype.pauseAction = function() {
    var curObj = this;
    if (this.attr.hasOwnProperty('_timeout') && this.attr._timeout){
      clearTimeout(curObj.attr._timeout);
    }
};

Game.Entity.prototype.addListener = function(ent,evtLabel,callLabel) {
  if(!this._listeners[evtLabel]) {this._listeners[evtLabel] = {};}
  this._listeners[evtLabel][ent.getId()] = callLabel;
  ent._listeningTo.push([evtLabel,this.getId()]);
};

Game.Entity.prototype.removeListener = function(listener) {
  for(var evtLabel in this._listeners) {
      if(this._listeners[evtLabel][listener.getId()]){
        delete this._listeners[evtLabel][listener.getId()];
      }
  }
  if(this._listeners[evtLabel].length < 1) {
    delete this._listeners[evtLabe];
  }
};

Game.Entity.prototype.raiseExternalEntityEvent = function(evtLabel,evtData) {
  for (var j = 0; j < this._mixins.length; j++) {
    var mixin = this._mixins[j];
    if (mixin.META.listeners && mixin.META.listeners[evtLabel]) {
      mixin.META.listeners[evtLabel].call(this,evtData);
    }
  }
};

Game.Entity.prototype.raiseEntityEvent = function(evtLabel,evtData) {
  if(this._listeners[evtLabel]) {
    var handled = false;
    for(var listener in this._listeners[evtLabel]) {
      Game.DATASTORE.ENTITY[listener].raiseExternalEntityEvent(this._listeners[evtLabel][listener], evtData);
    }
  }
  var response = {};
  if (!evtData || !evtData.handled) {
    for (var i = 0; i < this._mixins.length; i++) {
      var mixin = this._mixins[i];
      if (mixin.META.listeners && mixin.META.listeners[evtLabel]) {
        var resp = mixin.META.listeners[evtLabel].call(this,evtData);
        for (var respKey in resp) {
          if (resp.hasOwnProperty(respKey)) {
            if (! response[respKey]) { response[respKey] = []; }
            response[respKey].push(resp[respKey]);
          }
        }
      }
    }
  } else {
    response = evtData.response;
  }
  return response;
};

Game.Entity.prototype.destroy = function() {
    //remove from map
    this.getMap().extractEntity(this);
    if(this.hasOwnProperty('_actions')) {
      this.pauseAction();
    }
    if(this._listeningTo.length > 0) {
      for (var listening in this._listeningTo) {
        var ent = Game.DATASTORE.ENTITY[this._listeningTo[listening][1]];
        if(ent) {delete ent._listeners[this._listeningTo[listening][0]][this.getId()];}
      }
    }
    //remove from datastore
    delete Game.DATASTORE.ENTITY[this.getId()];
};

Game.Entity.prototype.isAllied = function (ent) {
  if(this.getAlligence() === 'self' || (typeof ent.getAlligence !== 'function')) return false;
  else {
    return this.getAllies()[ent.getAlligence()];
  }
};

Game.Entity.prototype.setAlliedWith = function (banner,allied){
  this.getAllies()[banner] = allied;
};

Game.Entity.prototype.getAllies = function () {
  return this.attr._allyHash;
};

Game.Entity.prototype.setAllies = function (allies) {
  this.attr._allyHash = allies;
};

Game.Entity.prototype.getAlligence = function () {
  return this.attr._alligence;
};

Game.Entity.prototype.setAlligence = function (a) {
  this.attr._alligence = a;
};
