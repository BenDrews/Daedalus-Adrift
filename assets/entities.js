Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr:'@',
  fg:'#dda',
  maxHp: 1,
  mixins: ["PlayerActor", "WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker", "PlayerMessager"]
});

Game.EntityGenerator.learn({
  name: 'slime',
  chr: '%',
  maxHp:1,
  mixins: ["HitPoints", "Chronicle"]
});

Game.EntityGenerator.learn({
  name: 'enemy',
  chr:'q',
  fg:'#dda',
  maxHp: 1,
  mixins: ["WanderActor", "WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker"]
});
