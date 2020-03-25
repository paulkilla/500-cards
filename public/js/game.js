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
  this.load.html('bidform', 'assets/html/bidform.html');
  this.load.image('background', 'assets/background.jpg');
  this.load.spritesheet('cards', 'assets/cards.png', {frameWidth: 52, frameHeight: 74});
}

function create() {
  let self = this;
  let countText;
  let currentPlayerText;
  let bidForm;
  this.add.image(440, 300, 'background');
  let socket = io();
  let welcomeText = this.add.text(275, 200, 'Please enter your name and select team.', { color: 'white', fontSize: '20px '});
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
        welcomeText.setText('Welcome ' + inputName.value + "... waiting on more players.");
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

  socket.on('broadcastPlayers', function (players) {
    console.log("New player joined. Players: ");
    console.log(players);
    let playerCount = 0;
    let listOfPlayers = '';
    if(countText != null) {
      countText.destroy();
      currentPlayerText.destroy();
    }

    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === socket.id) {
        console.log("New player joined. Existing: " + id);
        addPlayer(self, players[id]);
      }
      playerCount++;
      listOfPlayers += players[id].name + '(' + players[id].team + '), ';
    });
    countText = self.add.text(275, 300, 'Currently ' + playerCount + ' players joined. Waiting on ' + (6-playerCount) + ' more.', { color: 'white', fontSize: '20px '});
    currentPlayerText = self.add.text(275, 400, 'Players: ' + listOfPlayers.substring(0, listOfPlayers.length - 2));
    if(playerCount == 6) {
      countText.destroy();
      currentPlayerText.destroy();
      welcomeText.destroy();
    }
  });

  socket.on('startGame', function (players) {
    console.log("Start Game");
  });

  socket.on('showBidForm', function(data) {
    let currentBid = data.currentBid;
    let biddingPlayer = data.biddingPlayer;
    bidForm = self.add.dom(500, 300).createFromCache('bidform');
    document.getElementById('currentBid').innerHTML = 'Current Bid: ' + currentBid + ' (' + biddingPlayer + ')';
    bidForm.addListener('click');
    bidForm.on('click', function (event) {
      if (event.target.name === 'bidButton') {
        console.log("Bid Button selected.");
      }
      if (event.target.name === 'passButton') {
        console.log("Pass Button selected.");
      }
    });
  });

  socket.on('broadcastDeck', function (deck) {
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