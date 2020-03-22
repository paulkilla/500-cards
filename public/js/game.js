var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'phaser-example',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1068,
    height: 600
  }
};

var game = new Phaser.Game(config);

function preload() {
  // Load images here
  this.load.image('background', 'assets/background.jpg');
  this.load.spritesheet('cards', 'assets/cards.png', {frameWidth: 52, frameHeight: 74});
}

function create() {
  theGame = this;
  this.add.image(400, 300, 'background');
  let deck = getDeck();
  // Comment and uncomment below to show shuffled and not shuffled!
  //shuffle(deck);
  // Let's just display all the cards as an example!
  let i = 1;
  let j = 1;
  deck.forEach(function(value) {
    let image = theGame.add.image(i * 60, j * 70, 'cards', value.Sprite).setInteractive();
    theGame.input.setDraggable(image);
    i++;
    if(i % 17 == 0) {
      j++;
      i = 1;
    }
  });

  this.input.on('dragstart', function (pointer, gameObject) {
    this.children.bringToTop(gameObject);
  }, this);

  this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
}

function update() {

}