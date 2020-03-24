// add timestamps in front of log messages
require('console-stamp')(console, '[HH:MM:ss.l]');
let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);
const cards = require('cards');
let players = {};

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


  // Let new player see existing players
  socket.emit('broadcastPlayers', players);
  // Run this when we enter a name and team on the UI
  socket.on('addPlayer', function (newPlayer) {
    players[socket.id] = {
      name: newPlayer.name,
      team: newPlayer.team,
      playerId: socket.id
    };
    // Broadcast players list to all players.
    io.emit('broadcastPlayers', players);
    console.log(players);
    console.log(Object.keys(players).length);
    if(Object.keys(players).length == 2) {
      console.log("6 Players, let's deal!");
      let deck = createNewDeck(players);
      console.log("Created Deck for game");
      console.log(deck);
      io.emit('broadcastDeck', deck);
    }
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
  console.log(`Listening on ${server.address().port}`);
});

function createNewDeck(players) {
  let playersCards = [];
  let deck = new cards.Deck();
  ['spade', 'club', 'diamond', 'hearts'].forEach(function(suit) {
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'J', 'Q', 'K', 'A'].forEach(function(value) {
      if((suit == 'spade' || suit == 'club') && value == 13) {

      } else {
        deck.add(new cards.Card(suit, value));
      }
    });
  });
  deck.add((new cards.Card('other', 'joker')));
  let newDeck = [];
  let drawnCards = deck.draw(63);
  drawnCards.forEach(function(drawnCard, index) {
    console.log(index);
    newDeck.push({Value: drawnCard.value, Suit: drawnCard.suit, Sprite: index});
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
