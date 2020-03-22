export class Card extends Phaser.GameObjects.Sprite {
    cardValue;
    constructor(scene, x, y, myExtra)
    {
        super(scene, x, y, myExtra[0], myExtra[1]);
        console.log("Card value is: " + myExtra[2] + " " +  myExtra[3]);
        this.setCardValue(myExtra[2], myExtra[3]);
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