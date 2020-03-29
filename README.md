## Overview
So.... start of an online card game for 6 people playing 500!

### Pre-requisites
* nodejs / npm

## Getting Started
Clone to repo, then:
* npm install
* npm start server.js
 - If you get errors about some unicode chars in the cards.js I had to remove an item from line 67 of node_modules/cards/lib/cards.js (coin)

This will start a local http server on 8081 (Access by http://localhost:8081, or on your local network on 
http://ip.address:8081).

This way we can run it as a server, and access it, and we can do multiple players by just opening up a new tab in your 
browser.

## How it all works
So server.js runs all the server side code, any changes here require you stop stop the *npm start server.js* process.

Any changes to client side, just requires a Refresh (Ctrl + R).

We are using socket.io for the communication, in server.js you can see a big commented out section which explains 
when to perform a socket or io broadcast, and what the results are... this is useful so when an individual client as an 
example submits the bid form, we can then do stuff on the server side, then send a new request to the next player only 
to put there bid in, and we can pass information back with it, e.g. what the current bid is and who did it.

Socket.IO looks pretty cool, so you can see in server.js we do on connection, then we have more code in there for other 
server side actions which are called from the client (game.js). The client at any point we can make actions to talk to 
server.js (The server). e.g. when a user submits there name and team, in game.js we call 'addPlayer', which on the 
server.js side, does a bunch of things (like add the player to an object that stores all players), then it broadcasts 
out to all clients the players object, so that we can then display text like. 4 connected.. waiting on 2, and also list 
the players names and there team... It is a little confusing at times with the 2 way communication, but it works!

## References 
Using this as a reference for multiplayer (got it running locally the example):
* https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-1/
* https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/

And this for game example references:
* https://phaser.io/tutorials/making-your-first-phaser-3-game/part1

And Cards API:
* http://kbjr.github.io/node-cards/Card.html

But anything on phaser is good too!

## Notes
I've been using WebStorm to build this, IntelliJ IDEs are awesome, you can do a 30 day free evaluation. It also has 
all the plugins you can need, including one for nodejs.