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
  this.add.image(400, 300, 'background');
  for(let i = 1; i < 17; i++) {
    this.add.image(i*60 + 5, 50, 'cards', i - 1);
  }
  for(let i = 1; i < 17; i++) {
    this.add.image(i*60, 150, 'cards', i - 1 + 16);
  }

  for(let i = 1; i < 17; i++) {
    this.add.image(i*60, 250, 'cards', i - 1 + 32);
  }

  for(let i = 1; i < 17; i++) {
    this.add.image(i*60, 350, 'cards', i - 1 + 48);
  }

  for(let i = 1; i < 5; i++) {
    this.add.image(i*60, 450, 'cards', i - 1 + 64);
  }
}

function update() {

}