Game.ItemGenerator = new Game.Generator('items',Game.Item);

Game.ItemGenerator.learn({name: '_inventoryContainer', mixins: ["Container"]});
Game.ItemGenerator.learn({
  name: 'rock',
  chr:"&",
  fg:'#aaa'
});

Game.ItemGenerator.learn({
  name: 'oil',
  chr:"*",
  fg:'#aaa',
  foodValue: 100,
  mixins: ['Food']
});
