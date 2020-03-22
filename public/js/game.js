import {Card} from "./src/Card.js";
import {Bid} from "./src/Bid.js";

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
//Hard Code username for now...
var myUsername = 'A';

function preload() {
  // Load images here
  this.load.image('background', 'assets/background.jpg');
  this.load.spritesheet('cards', 'assets/cards.png', {frameWidth: 52, frameHeight: 74});
}

function create() {
  //Declare theGame as this local object, so we can use it inside forEach loops etc where you can reference this as
  // that object.
  let theGame = this;
  let players = [{'name': 'A', 'team': 'Red'}, {'name': 'B', 'team': 'Blue'}, {'name': 'C', 'team': 'Red'},
                  {'name': 'D', 'team': 'Blue'}, {'name': 'E', 'team': 'Red'}, {'name': 'F', 'team': 'Blue'}];
  this.add.image(400, 300, 'background');

  // Put player labels on the table
  players.forEach(function(value, playerCount) {
    if(playerCount > 2) {
      theGame.add.text((320 * (playerCount++ - 3)) + 190, 560, value.name, { fontSize: '32px', fill: value.team});
    } else {
      theGame.add.text((320 * playerCount++) + 190, 16, value.name, { fontSize: '32px', fill: value.team});
    }
  });


  let deck = getDeck();
  // Comment and uncomment below to show shuffled and not shuffled!
  shuffle(deck);
  // Let's just display all the cards as an example!
  let playerCardCount = 0;
  let player = 0;
  deck.forEach(function(value) {
    let theCard;
    if(player < 6) {
      theCard = theGame.add.existing( new Card(theGame, playerCardCount * 45 + 30, player * 70 + 100,
          {'scene': 'cards', 'sprite': value.Sprite, 'value': value.Value, 'suit': value.Suit, 'currentUser': myUsername, 'player': players[player].name, 'cardCount': playerCardCount}) );
      if(myUsername == players[player].name) {
        theCard.setInteractive();
        theGame.input.setDraggable(theCard);
        theGame.input.on('dragstart', function (pointer, gameObject) {
          theGame.children.bringToTop(gameObject);
        }, this);

        theGame.input.on('drag', function (pointer, gameObject, dragX, dragY) {
          gameObject.x = dragX;
          gameObject.y = dragY;
        });
      }
    } else {
      theCard = theGame.add.existing( new Card(theGame, playerCardCount * 45 + 30, player * 70 + 100,
          {'scene': 'cards', 'sprite': value.Sprite, 'value': value.Value, 'suit': value.Suit, 'currentUser': myUsername, 'player': '_kitty', 'cardCount': playerCardCount}) );
    }
    playerCardCount++;
    if(playerCardCount % 10 == 0) {
      player++;
      playerCardCount = 0;
    }
  });
  //this.scene.add('bid', Bid, true, { x: 400, y: 300 });
}

function update() {

}