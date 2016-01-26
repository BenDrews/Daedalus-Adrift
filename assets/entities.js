Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr:'@',
  maxHp: 10,
  mixins: ["PlayerActor", "NarrowSight", "MapMemory", "WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker", "PlayerMessager"]
});

Game.EntityGenerator.learn({
  name: 'slime',
  chr: '%',
  maxHp:1,
  mixins: ["HitPoints", "Chronicle", "RandomActor", "WalkerCorporeal"]
});

Game.EntityGenerator.learn({
  name: 'enemy',
  chr:'q',
  maxHp: 10,
  mixins: [ "WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker","ClayActor"]
});

Game.EntityGenerator.learn({
  name: 'projectile',
  chr:'1',
  mixins: [ "WalkerCorporeal", "Bullet"]
});
