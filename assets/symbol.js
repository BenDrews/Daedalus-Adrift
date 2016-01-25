Game.Symbol = function (template) {
  template = template || {};
  if (! ('attr' in this)) { this.attr = {}; }
  this.attr._char = template.chr || ' ';
  this.attr._fg = template.fg || "transparent";
  this.attr._bg = template.bg || Game.UIMode.DEFAULT_COLOR_BG;
};
Game.Symbol.prototype.getColorDesignator = function(){
     return '%c{'+this.attr._fg+'}%b{'+this.attr._bg+'}';
};

Game.Symbol.prototype.setChar = function(chr) {
  this.attr._char = chr;
};

Game.Symbol.prototype.getRepresentation = function() {
  return '%c{' + this.attr._fg + '}%b{' + this.attr._bg + '}' + this.attr._char;
};

Game.Symbol.prototype.getChar = function () {
  return this.attr._char;
};

Game.Symbol.prototype.getFg = function () {
  return this.attr._fg;
};

Game.Symbol.prototype.getBg = function () {
  return this.attr._bg;
};

Game.Symbol.prototype.draw = function (display,disp_x,disp_y,masked) {
  if(masked) {
    display.draw(disp_x,disp_y,[this.attr._char, 'z'], this.attr._fg);
  } else {
  display.draw(disp_x,disp_y,this.attr._char, this.attr._fg);
}
};

Game.Symbol.NULL_SYMBOL = new Game.Symbol();
Game.Symbol.AVATAR = new Game.Symbol({chr:'@',fg:'#dda'});
Game.Symbol.ENEMY = new Game.Symbol({chr:'q',fg:'#dda'});
Game.Symbol.ITEM_PILE = new Game.Symbol({chr: '&', fg: '#dcc'});
