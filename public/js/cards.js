let suits = ['spades', 'clubs', 'diamonds', 'hearts'];
let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', 'J', 'Q', 'K'];

function getDeck() {
    let deck = new Array();
    let count = 0;
    for(let i = 0; i < suits.length; i++) {
        for(let x = 0; x < values.length; x++) {
            let card = {Value: values[x], Suit: suits[i], Sprite: count};
            deck.push(card);
            count++;
        }
    }
    // Let's add a Joker!
    // Also of note, Sprite 64 is the back of the cards.. good to know for later!
    deck.push({Value: 'Joker', Suit: null, Sprite: 65});
    return deck;
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function renderCard(card, element) {
    let value = card.Value;
    let suit = card.Suit;
    element.style.backgroundImage = 'assets/cards.png';
    element.style.backgroundPosition = '-256px 0px';
}