So.... start of an online card game for 6 people playing 500!

Clone to repo, then:
* npm install
* might need to run this? npm install git+https://git@github.com/SyntaxC4/node-cards.git
* npm start server.js

This will start a local http server on 8081 (Access by http://localhost:8081).

This way we can run it as a server, and access it with multi players using private browser tabs and other 
browsers... IE, shudder.

How good is this README!

Using this as a reference for multiplayer (got it running locally the example):

https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-1/

https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/

And this for game example references:
https://phaser.io/tutorials/making-your-first-phaser-3-game/part1

But anything on phaser is good too!

Looks like some logic needs to go in server.js, e.g. what to do when a new player joins, storing things like Player 
names and teams, and also things like when bids are done, and cards are played etc.