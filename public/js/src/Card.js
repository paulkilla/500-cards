export class Card extends Phaser.GameObjects.Sprite {
    cardValue;
    constructor(scene, x, y, myExtra)
    {
        if(myExtra.currentUser == myExtra.player) {
            super(scene, x, y, myExtra.scene, myExtra.sprite);
        } else {
            if(myExtra.cardCount != 0) {
                x = x - (25 * myExtra.cardCount);
            }
            super(scene, x, y, myExtra.scene, 64);
        }
        this.setCardValue(myExtra.suit, myExtra.value);
    }

    setCardValue(suit, value) {
        this.cardValue = {
          'suit': suit,
          'value': value
        };
    }

    getCardValue() {
        return this.cardValue;
    }
}