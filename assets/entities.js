Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr:'@',
  maxHp: 10,
  inventoryCapacity: 3,
  mixins: ["PlayerActor", "NarrowSight", "MapMemory", "WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker", "PlayerMessager", "InventoryHolder"]
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
  maxHp: 1,
  mixins: ["WanderActor", "WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker", "ShooterActor"]
});

Game.EntityGenerator.learn({
  name: 'projectile',
  chr:'1',
  mixins: [ "WalkerCorporeal", "Bullet"]
});
