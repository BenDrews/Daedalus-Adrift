Game.ItemGenerator = new Game.Generator('items',Game.Item);

Game.ItemGenerator.learn({name: '_inventoryContainer', mixins: ["Container"]});
Game.ItemGenerator.learn({
  name: 'rock',
  description: 'a generic lump of hard mineral',
  chr:String.fromCharCode(174),
  fg:'#bbc',
  bg: '#000'
});

Game.ItemGenerator.learn({
  name: 'apple',
  description: 'a nice juicy apple - yum!',
  chr:String.fromCharCode(174),
  fg:'#f32',
  bg: '#000',
  foodValue: 100,
  mixins: ['Food']
});

Game.ItemGenerator.learn({
  name: 'delatcher',
  description: 'it delatches slimes',
  chr:String.fromCharCode(174),
  fg:'#f32',
  bg: '#000',
  foodValue: -200,
  mixins: ['Food']
});

Game.ItemGenerator.learn({
  name: 'repair kit',
  description: 'it repairs engines',
  chr:String.fromCharCode(174),
  fg:'#f32',
  bg: '#000',
  foodValue: -200,
  mixins: ['Food']
});
