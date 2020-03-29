import {Card} from "./src/Card.js";

const config = {
  type: Phaser.AUTO,
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
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

let game = new Phaser.Game(config);
let socketId = null;
let players = [];
let allCards = [];
let message = null;
let kittyCards = [];
let lastCardLocation = {};
let myCards = [];
let currentPlayerText;
let welcomeText;
let removedCards = 0;
let width = 0;
let height = 0;

function preload() {
  // Load images here
  this.load.html('nameform', 'assets/html/nameform.html');
  this.load.html('bidform', 'assets/html/bidform.html');
  this.load.image('background', 'assets/background.jpg');
  this.load.spritesheet('cards', 'assets/cards.png', {frameWidth: 52, frameHeight: 74});
  this.canvas = this.sys.game.canvas;
}

function create() {
  width = this.sys.game.canvas.width;
  height = this.sys.game.canvas.height;
  let self = this;
  let bidForm;
  this.add.image(440, 300, 'background');
  let socket = io();
  welcomeText = this.add.text(275, 200, 'Please enter your name and select team.', { color: 'white', fontSize: '20px '});
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
    if(currentPlayerText != null) {
      currentPlayerText.destroy();
    }

    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === socket.id) {
        addPlayer(self, players[id]);
      }
      playerCount++;
      listOfPlayers += players[id].name + '(' + players[id].team + '), ';
    });
    clearMessage();
    message = self.add.text(275, 300, 'Currently ' + playerCount + ' players joined. Waiting on ' + (6-playerCount) + ' more.', { color: 'white', fontSize: '20px '});
    currentPlayerText = self.add.text(275, 400, 'Players: ' + listOfPlayers.substring(0, listOfPlayers.length - 2));
  });

  socket.on('startGame', function (data) {
    console.log("Start Game");
    let currentBid = data.bid;
    let trumps = data.trumps;
    let tricksRequired = data.tricksRequired;
    let bidWinner = data.bidWinner;
    console.log("Bid: " + currentBid);
    console.log("Trumps: " + trumps);
    console.log("Tricks Needed: " + tricksRequired);
    console.log("Bid Winner: " + bidWinner);

  });

  socket.on('broadcastDeck', function (deck) {
    clearBeforeRound();
    allCards = [];
    deck.forEach(function(hand, playerCount) {
      let cards = hand.cards;
      cards.sort((a, b) => (a.SortValue > b.SortValue) ? 1 : -1);
      cards.forEach(function(card,cardCount) {
        console.log(card.rank);
        let x = cardCount * 45 + 30;
        let y = playerCount * 70 + 100;
        let theCard = self.add.existing( new Card(self, x, y,
            {'scene': 'cards', 'sprite': card.Sprite, 'value': card.Value,
              'suit': card.Suit, 'currentUser': socketId, 'player': hand.player,
              'cardCount': cardCount, 'sortValue': card.SortValue}) );
        theCard.setScale(0.95);
        if(socketId == hand.player) {
          myCards.push(theCard);
          // theCard.setInteractive();
          // self.input.setDraggable(theCard);
          // self.input.on('dragstart', function (pointer, gameObject) {
          //   self.children.bringToTop(gameObject);
          // }, this);
          // self.input.on('drag', function (pointer, gameObject, dragX, dragY) {
          //   gameObject.x = dragX;
          //   gameObject.y = dragY;
          // });
          //Set this so we can use it later to add the kitty to the end.
          lastCardLocation = {x: x, y: y};
        }
        if('_kitty_' == hand.player) {
          kittyCards.push(theCard);
        }
        allCards.push(theCard);
      });
    });
  });

  socket.on('showBidForm', function(data) {
    let currentBid = data.currentBid;
    let biddingPlayer = data.biddingPlayer;
    let finalCall = data.final;
    let previousBids = data.previousBids;
    bidForm = self.add.dom(width - 250, 300).createFromCache('bidform');
    document.getElementById('currentBid').innerHTML = 'Current Bid: ' + currentBid + ' (' + biddingPlayer + ')';
    if(finalCall) {
      document.getElementById('bidButton').style.display = 'none';
      if(currentBid != 'PASS!') {
        document.getElementById('passButton').style.display = 'none';
      }
      document.getElementById('finalButton').style.display = 'block';
    }

    previousBids.forEach(function(item) {
      let node = document.createElement('li');
      let text = document.createTextNode(item);
      node.appendChild(text);
      document.getElementById('previousBids').appendChild(node);
    });
    bidForm.addListener('click');
    bidForm.on('click', function (event) {
      if (event.target.name === 'bidButton' || event.target.name == 'finalButton') {
        console.log("Bid Button selected.");
        let bids = document.getElementsByName('bid');
        let bidSelected = null;
        for (let i = 0, length = bids.length; i < length; i++) {
          if (bids[i].checked) {
            bidSelected = bids[i].value;
            break;
          }
        }
        if(bidSelected != null) {
          if(bidToPoints(bidSelected) > bidToPoints(currentBid)) {
            // Bid is valid
            if(finalCall) {
              socket.emit('submitBid', {'bidOrPass': 'final', 'bid': bidSelected});
            } else {
              socket.emit('submitBid', {'bidOrPass': 'bid', 'bid': bidSelected});
            }
            this.destroy();
          } else {
            // Bid is less than or the same as current bid... unless final it can be the same.
            if(finalCall && bidToPoints(bidSelected) >= bidToPoints(currentBid)) {
              socket.emit('submitBid', {'bidOrPass': 'final', 'bid': bidSelected});
              this.destroy();
            } else {
              // Not final bid and/or bid is lower than original bid.
              alert('Bid must be higher than ' + (bidToPoints(currentBid)));
            }
          }
        }
      }
      if (event.target.name === 'passButton') {
        socket.emit('submitBid', {'bidOrPass': 'pass'});
        this.destroy();
      }
    });
  });

  socket.on('showKitty', function () {
    console.log("Show Kitty");
    message = self.add.text(275, 20, 'Select 3 cards to discard', { color: '#000000', fontSize: '20px', fontStyle: 'bold', backgroundColor: '#FFFFFF'});
    kittyCards.forEach(function(item, index) {
      item.showCardFace();
      item.x = lastCardLocation.x + (45 * (index + 1));
      item.y = lastCardLocation.y;
      myCards.push(item);
    });

    myCards.forEach(function (item, index) {
      item.setInteractive().on('pointerdown', function _handleKitty() {
        removedCards++;
        for(let i = myCards.length - 1; i >= 0; i--) {
          if(myCards[i] === index) {
            myCards.splice(i, 1);
          }
        }
        if(removedCards == 3) {
          myCards.forEach(function (itemAgain) {
            if(itemAgain.scene != null) {
              itemAgain.removeInteractive();
            }
          });
          socket.emit('discardCards');
        }
        item.destroy();
      });
    });
  });

  socket.on('message', function(theMessage) {
    console.log('Inside message');
    clearMessage();
    message = self.add.text(275, 300, theMessage, { color: '#000000', fontSize: '20px', fontStyle: 'bold', backgroundColor: '#FFFFFF'});
  });

}

function update() {

}


function addPlayer(self, playerInfo) {
  //self.add.text((320) + 190, 16, playerInfo.name, { fontSize: '32px', fill: playerInfo.team});
  players.push(playerInfo);
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

function clearMessage() {
  if(message != null) {
    message.destroy();
  }
}

function clearBeforeRound() {
  removedCards = 0;
  myCards.forEach(function (item) {
    item.destroy();
  });
  currentPlayerText.destroy();
  welcomeText.destroy();
  clearMessage();
  allCards.forEach(function(item) {
    item.destroy();
  });
  kittyCards.forEach(function(item) {
    item.destroy();
  });
}

function bidToPoints(bid) {
  if(bid == '6S') {
    return 40;
  } else if(bid == '7S') {
    return 140;
  } else if(bid == '8S') {
    return 240;
  } else if(bid == '9S') {
    return 340;
  } else if(bid == '10S') {
    return 440;
  } else if(bid == '6C') {
    return 60;
  } else if(bid == '7C') {
    return 160;
  } else if(bid == '8C') {
    return 260;
  } else if(bid == '9C') {
    return 360;
  } else if(bid == '10C') {
    return 460;
  } else if(bid == '6D') {
    return 80;
  } else if(bid == '7D') {
    return 180;
  } else if(bid == '8D') {
    return 280;
  } else if(bid == '9D') {
    return 380;
  } else if(bid == '10D') {
    return 480;
  } else if(bid == '6H') {
    return 100;
  } else if(bid == '7H') {
    return 200;
  } else if(bid == '8H') {
    return 300;
  } else if(bid == '9H') {
    return 400;
  } else if(bid == '10H') {
    return 500;
  } else if(bid == '6N') {
    return 120;
  } else if(bid == '7N') {
    return 220;
  } else if(bid == '8N') {
    return 320;
  } else if(bid == '9N') {
    return 420;
  } else if(bid == '10N') {
    return 520;
  }
  return 0;
}