Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr:'@',
  maxHp: 10,
  inventoryCapacity: 30,
  sightRange:'360',
  mixins: ["PlayerActor", "Sight", "MapMemory", "WalkerCorporeal", "HitPoints", "Chronicle", "PlayerMessager", "InventoryHolder"]
});

Game.EntityGenerator.learn({
  name: 'slime',
  extChar: ['7','8','9','0'],
  chr: '%',
  maxHp:1,
  topology:4,
  alligence:'slime',
  mixins: ["HitPoints", "WalkerSegmented", "Sight", "WanderChaserActor","Chronicle","LatchExploder"]
});

Game.EntityGenerator.learn({
  name: 'enemy',
  chr:'!',
  maxHp: 10,
  mixins: ["WanderActor", "WalkerGiant", "HitPoints", "Chronicle", "MeleeAttacker", "ShooterActor"]
});

Game.EntityGenerator.learn({
  name: 'projectile',
  chr:'*',
  mixins: [ "WalkerCorporeal", "Bullet"]
});
