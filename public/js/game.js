import {Card} from "./src/Card.js";
import {Bid} from "./src/Bid.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  dom: {
    createContainer: true
  },
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

let game = new Phaser.Game(config);
let socketId = null;
let players = [];

function preload() {
  // Load images here
  this.load.html('nameform', 'assets/html/nameform.html');
  this.load.image('background', 'assets/background.jpg');
  this.load.spritesheet('cards', 'assets/cards.png', {frameWidth: 52, frameHeight: 74});
}

function create() {
  let self = this;
  this.add.image(440, 300, 'background');
  let socket = io();
  let text = this.add.text(275, 200, 'Please enter your name and select team.', { color: 'white', fontSize: '20px '});
  let element = this.add.dom(500, 300).createFromCache('nameform');
  element.addListener('click');
  element.on('click', function (event) {
    if (event.target.name === 'playButton') {
      let inputName = this.getChildByName('nameField');
      let teamSelection = document.getElementsByName('team');
      let teamSelected = null;
      for (let i = 0, length = teamSelection.length; i < length; i++) {
        if (teamSelection[i].checked) {
          teamSelected = teamSelection[i].value;
          break;
        }
      }
      if (inputName.value !== '' && teamSelected != null) {
        //  Turn off the click events
        this.removeListener('click');
        //  Hide the login element
        this.setVisible(false);
        text.setText('Welcome ' + inputName.value);
        players[socket.id] = {
          name: inputName.value,
          playerId: socket.id,
          team: teamSelected
        };
        socket.emit('addPlayer', players[socket.id]);
        socketId = socket.id;
      }
    }
  });

  // Put player labels on the table
  /*players.forEach(function(value, playerCount) {
    if(playerCount > 2) {
      self.add.text((320 * (playerCount++ - 3)) + 190, 560, value.name, { fontSize: '32px', fill: value.team});
    } else {
      self.add.text((320 * playerCount++) + 190, 16, value.name, { fontSize: '32px', fill: value.team});
    }
  });*/

  socket.on('broadcastPlayers', function (players) {
    console.log("New player joined. Players: ");
    console.log(players);
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === socket.id) {
        console.log("New player joined. Existing: " + id);
        addPlayer(self, players[id]);
      }
    });
  });

  socket.on('broadcastDeck', function (deck) {
    console.log("Dished up another deck!");
    console.log(deck);
    deck.forEach(function(hand, playerCount) {
      let cards = hand.cards;
      cards.forEach(function(card,cardCount) {
        let theCard = self.add.existing( new Card(self, cardCount * 45 + 30, playerCount * 70 + 100,
            {'scene': 'cards', 'sprite': card.Sprite, 'value': card.Value,
              'suit': card.Suit, 'currentUser': socketId, 'player': hand.player,
              'cardCount': cardCount}) );
        if(socketId == hand.player) {
          theCard.setInteractive();
          self.input.setDraggable(theCard);
          self.input.on('dragstart', function (pointer, gameObject) {
            self.children.bringToTop(gameObject);
          }, this);

          self.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
          });
        }
      });
    });
  });

}

function update() {

}


function addPlayer(self, playerInfo) {
  //self.add.text((320) + 190, 16, playerInfo.name, { fontSize: '32px', fill: playerInfo.team});
  players.push(playerInfo);
  //self.ship = self.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  if (playerInfo.team === 'Blue') {
    //self.ship.setTint(0x0000ff);
  } else {
    //self.ship.setTint(0xff0000);
  }
}

function addOtherPlayers(self, playerInfo) {
  console.log("Inside addOtherPlayers");
  //const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  if (playerInfo.team === 'Blue') {
    //otherPlayer.setTint(0x0000ff);
  } else {
    //otherPlayer.setTint(0xff0000);
  }
  //otherPlayer.playerId = playerInfo.playerId;
  //self.otherPlayers.add(otherPlayer);
}