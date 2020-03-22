export class Bid extends Phaser.Scene {
    constructor(config) {
        super(config);
    }

    preload() {

    }

    create(data) {
        var info = this.add.text(10, 10, 'Score: 0', { font: '48px Arial', fill: '#000000' });
    }

}