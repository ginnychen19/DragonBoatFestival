class Layer {
    constructor(game, width, height, speedModifier, image) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.speedModifier = speedModifier;
        this.image = image;
        this.x = 0;
        this.y = 0;
    }
    update() {
        if (this.y < -this.height) this.y = 0;
        else this.y -= this.game.speed * this.speedModifier;
    }
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
}

export class Background extends Layer {
    constructor(game) {
        super();
        this.game = game;
        this.width = 1667;
        this.height = 500;
    }
    update() {
    }
    draw(context) {
        context.save();
        const gradient = context.createLinearGradient(160, 0, 160, 625);
        gradient.addColorStop(0, '#266f72');
        gradient.addColorStop(0.4, '#63AEA8');
        gradient.addColorStop(0.6, '#63AEA8');
        gradient.addColorStop(1, '#266f72');
        context.fillStyle = gradient;
        context.fillRect(
            0, 0,
            this.game.width, this.game.height
        );
        context.restore();

    }
}

