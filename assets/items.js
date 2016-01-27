Game.ItemGenerator = new Game.Generator('items',Game.Item);

Game.ItemGenerator.learn({name: '_inventoryContainer', mixins: ["Container"]});
Game.ItemGenerator.learn({
  name: 'rock',
  description: 'a generic lump of hard mineral',
  chr:String.fromCharCode(91),
  fg:'#bbc',
  bg: '#000'
});

Game.ItemGenerator.learn({
  name: 'battery',
  description: 'battery provides energy required to use the delatcher',
  chr:String.fromCharCode(93),
  fg:'#f32',
  bg: '#000',
  foodValue: 100,
  mixins: ['Food']
});

Game.ItemGenerator.learn({
  name: 'delatcher',
  description: 'it delatches slimes. Uses up energy',
  chr:String.fromCharCode(91),
  fg:'#f32',
  bg: '#000',
  foodValue: -200,
  mixins: ['Food']
});

Game.ItemGenerator.learn({
  name: 'repair kit',
  description: 'it repairs engines',
  chr:String.fromCharCode(91),
  fg:'#f32',
  bg: '#000',
  foodValue: 0,
  mixins: ['Food']
});
