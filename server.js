// add timestamps in front of log messages
require('console-stamp')(console, '[HH:MM:ss.l]');
let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);
const cards = require('cards');
let players = {};
let scores = {'blue': 0, 'red': 0};
let currentIndex = 0;
let currentPlayer = 0;
let biddingPlayer = '';
let currentBid = '';
let passedPlayers = [];
// Change this to deal cards earlier.
const PLAYERS = 6;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('New Connection: ', socket.id);
  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  // Run this when we enter a name and team on the UI
  socket.on('addPlayer', function (newPlayer) {
    players[socket.id] = {
      name: newPlayer.name,
      team: newPlayer.team,
      playerId: socket.id
    };
    // Broadcast players list to all players.
    io.emit('broadcastPlayers', players);
    // Change this to deal cards at an earlier point, otherwise 6?
    if(Object.keys(players).length == PLAYERS) {
      scores = {'blue': 0, 'red': 0};
      io.emit('startGame', players);
      let startingPlayer = Math.round(Math.random() * (PLAYERS - 1));
      currentIndex = startingPlayer;
      startRound(socket, currentIndex);
    }
  });

  // Run this when we enter a name and team on the UI
  socket.on('submitBid', function (data) {
    console.log("Received submitBid");
    console.log(data);
    let bidOrPass = data.bidOrPass;
    let bid = data.bid;
    if(bidOrPass == 'bid') {
      biddingPlayer = socket.id;
      currentBid = bid;
    } else if(bidOrPass == 'pass') {
      // Do we need to do anything, maybe check if all players passed?
      passedPlayers.push(socket.id);
      if(passedPlayers.length == Object.keys(players).length) {
        //Everyone passed, re-deal!
        currentIndex = getNextPlayer(currentIndex);
        startRound(socket, currentIndex);
        return;
      }
      if(biddingPlayer == '') {
        biddingPlayer = socket.id;
        currentBid = 'PASS!';
      }
    }

    if(bidOrPass == 'final') {
      // Final bid, submitted, kick off game!
      //FINAL BID and WINNER OF BID
      currentBid = bid;
      biddingPlayer = socket.id;
      console.log("Final Bid submitted - Time to let the winning player see the kitty and choose their cards! " + players[biddingPlayer].name);
      socket.emit('showKitty');
      socket.broadcast.emit('message', 'Waiting on ' + players[biddingPlayer].name + ' to discard 3 cards...');
    } else {
      // If false, it means everyone has passed except this last player.. so show form with final choice.
      let shown = showNextBidForm(socket, currentBid, biddingPlayer);
      console.log("Bidding Result: " + shown);
    }
  });

  socket.on('discardCards', function (data){
    console.log("Cards Discarded... starting game.");
    console.log(data);

    // io.emit('startGame', {'bid': currentBid, 'trumps': 'suit_here', 'tricks_required': 'tricks_required', 'bidWinner': players[biddingPlayer].name});
  });



  //Paul's doco on when to use socker vs io vs broadcast etc:
  // socket.emit('message', "this is a test"); //sending to sender-client only
  // socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender
  // socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender
  // socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)
  // socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid
  // io.emit('message', "this is a test"); //sending to all clients, include sender
  // io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender
  // io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender
  // socket.emit(); //send to all connected clients
  // socket.broadcast.emit(); //send to all connected clients except the one that sent the message
  // socket.on(); //event listener, can be called on client to execute on server
  // io.sockets.socket(); //for emiting to specific clients
  // io.sockets.emit(); //send to all connected clients (same as socket.emit)
  // io.sockets.on() ; //initial connection from a client.

});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().address}:${server.address().port}`);
});


/**
 * Use this function to start the round, creates the deck and broadcasts it to all players, also does the initial bid form
 * @param socket
 * @param startingPlayer (index of starting player)
 */
function startRound(socket, startingPlayer) {
  biddingPlayer = '';
  currentBid = '';
  passedPlayers = [];
  console.log("Inside startRound with starting player: " + startingPlayer);
  console.log("Deal out deck to all players");
  let deck = createNewDeck(players);
  io.emit('broadcastDeck', deck);
  let count = 0;
  for (let key in players) {
    if(count == startingPlayer) {
      // Set the currentPlayer index to this player (we will use this later to decide who's turn is next + bidding)
      currentPlayer = startingPlayer;
      console.log("Starting Round with player: " + players[key].name);
      // Send bid screen for first player
      socket.broadcast.to(players[key].playerId).emit('showBidForm', {'currentBid': 'N/A', 'biddingPlayer': 'N/A'});
      break;
    }
    count++;
  }
}

/**
 * Broadcasts the bid form to the next player who hasn't passed yet.
 * @param socket
 * @param bid
 * @param biddingPlayer
 * @returns {boolean}
 */
function showNextBidForm(socket, bid, biddingPlayer) {
  console.log(biddingPlayer);
  currentPlayer = getNextPlayer(currentPlayer);
  let count = 0;
  for (let key in players) {
    if(count == currentPlayer) {
      if(!passedPlayers.includes(players[key].playerId)) {
        // Make sure we only do this for non-passed players
        console.log("Next player to bid: " + players[key].name);
        // Send bid screen of next player
        if(passedPlayers.length == Object.keys(players).length - 1) {
          // This means everyone else has passed, show form with this info on it.
          socket.broadcast.to(players[key].playerId).emit('showBidForm', {'currentBid': bid, 'biddingPlayer': players[biddingPlayer].name, 'final': true});
        } else {
          socket.broadcast.to(players[key].playerId).emit('showBidForm', {'currentBid': bid, 'biddingPlayer': players[biddingPlayer].name, 'final': false});
        }
        return true;
      } else {
        // Need to do recursion here
        return showNextBidForm(socket, bid, biddingPlayer);
      }
      break;
    }
    count++;
  }
  return false;
}

/**
 * Use this function to create the deck of cards for each round
 * @param players
 * @returns [] array of cards {[]}
 */
function createNewDeck(players) {
  let playersCards = [];
  let deck = new cards.Deck();
  ['diamonds', 'hearts', 'spades', 'clubs'].forEach(function(suit) {
    ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'J', 'Q', 'K'].forEach(function(value) {
      deck.add(new cards.Card(suit, value));
    });
  });
  deck.add((new cards.Card('other', 'joker')));
  let newDeck = [];
  let drawnCards = deck.draw(65);
  drawnCards.forEach(function(drawnCard, index) {
    if(drawnCard.value == 'joker') {
      newDeck.push({Value: drawnCard.value, Suit: drawnCard.suit, Sprite: 65, SortValue: 999});
    } else {
      if(drawnCard.value == 13 && (drawnCard.suit == 'spades' || drawnCard.suit == 'clubs')) {
        console.log("We don't want these cards");
      } else {
        let sortValue = index;
        if(drawnCard.value == 'A') {
          sortValue = index + 15;
        } else {
          sortValue = index - 1;
        }
        newDeck.push({Value: drawnCard.value, Suit: drawnCard.suit, Sprite: index, SortValue: sortValue});
      }
    }
  });
  for (let i = newDeck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = newDeck[i];
    newDeck[i] = newDeck[j];
    newDeck[j] = temp;
  }
  let totalCardCount = 0;
  Object.keys(players).forEach(function(key) {
    let playerCards = [];
    let playerCardCount = 1;
    for (totalCardCount; totalCardCount < newDeck.length; totalCardCount++) {
      playerCards.push(newDeck[totalCardCount]);
      playerCardCount++;
      if(playerCardCount > 10) {
        totalCardCount++;
        break;
      }
    };
    playersCards.push({'player': players[key].playerId, 'cards': playerCards})
  });

  let kittyCards = [];
  for(totalCardCount; totalCardCount < newDeck.length; totalCardCount++) {
    kittyCards.push(newDeck[totalCardCount]);
  }
  playersCards.push({'player': '_kitty_', 'cards': kittyCards});

  return playersCards;
}

let getNextPlayer = function(playerNumber) {
  if(playerNumber == Object.keys(players).length - 1) {
    playerNumber = 0;
  } else {
    playerNumber++;
  }
  return playerNumber;
};