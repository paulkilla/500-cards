let suits = ['spades', 'clubs', 'diamonds', 'hearts'];
let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', 'J', 'Q', 'K'];

function getDeck() {
    let deck = new Array();

    for(let i = 0; i < suits.length; i++) {
        for(let x = 0; x < values.length; x++) {
            let card = {Value: values[x], Suit: suits[i]};
            deck.push(card);
        }
    }
    // Let's add a Joker!
    deck.push({Value: 'Joker', Suit: null});
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