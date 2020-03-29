export class Card extends Phaser.GameObjects.Sprite {
    cardValue;
    extraData;
    rank;
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
        this.setExtraData(myExtra);
        this.setCardRank(myExtra);
    }

    setExtraData(extraData) {
        this.extraData = extraData;
    }

    setCardValue(suit, value) {
        this.cardValue = {
          'suit': suit,
          'value': value
        };
    }

    setCardRank(extraData) {
        this.rank = extraData.sortValue;
    }

    getCardRank() {
        return this.rank;
    }

    getCardValue() {
        return this.cardValue;
    }

    getExtraData() {
        return this.extraData;
    }

    showCardFace() {
        super.setFrame(this.extraData.sprite);
    }
}