Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr:'@',
  maxHp: 10,
  mixins: ["PlayerActor", "NarrowSight", "MapMemory", "WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker", "PlayerMessager"]
});

Game.EntityGenerator.learn({
  name: 'slime',
  extChar: ['7','8','9','0'],
  chr: '%',
  maxHp:1,
  mixins: ["HitPoints", "WalkerSegmented", "WanderActor","Chronicle"]
});

Game.EntityGenerator.learn({
  name: 'enemy',
  chr:'!',
  maxHp: 1,
  mixins: ["WanderActor", "WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker", "ShooterActor"]
});

Game.EntityGenerator.learn({
  name: 'projectile',
  chr:'*',
  mixins: [ "WalkerCorporeal", "Bullet"]
});
