Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr:'@',
  fg:'#dda',
  maxHp: 10,
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
  mixins: ["WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker", "ShooterActor"]
});

Game.EntityGenerator.learn({
  name: 'projectile',
  chr:'z',
  fg:'#dda',
  mixins: ["WanderActor", "WalkerCorporeal", "Chronicle", "Projectile"]
});
