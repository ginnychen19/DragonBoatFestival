//製作滾動視差背景
class Layer {
    constructor(game, width, height, speedModifier, image) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.speedModifier = speedModifier; //調整移動速率
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
        //--------------------------- + this.width就可以有無限延長的效果。
        context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
}

export class Background extends Layer {
    constructor(game) {
        super();
        this.game = game;
        this.width = 1667;
        this.height = 500;
        // this.layer1image = document.getElementById("layer1");
        // this.layer2image = document.getElementById("layer2");
        // this.layer3image = document.getElementById("layer3");
        // this.layer4image = document.getElementById("layer4");
        // this.layer5image = document.getElementById("layer5");
        // this.layer1 = new Layer(this.game, this.width, this.height, 0, this.layer1image);
        // this.layer2 = new Layer(this.game, this.width, this.height, 0.2, this.layer2image);
        // this.layer3 = new Layer(this.game, this.width, this.height, 0.4, this.layer3image);
        // this.layer4 = new Layer(this.game, this.width, this.height, 0.8, this.layer4image);
        // this.layer5 = new Layer(this.game, this.width, this.height, 1, this.layer5image);
        // this.backgroundLayers = [
        //     this.layer1,
        //     this.layer2,
        //     this.layer3,
        //     this.layer4,
        //     this.layer5,
        // ];
    }
    update() {
        // this.backgroundLayers.forEach(layer => {
        //     layer.update();
        // })
    }
    /* 漸層內容固定，建一次就好；需要 context 所以在第一次 draw 時建立 */
    gradientFor(context) {
        if (!this.gradient) {
            const gradient = context.createLinearGradient(160, 0, 160, this.game.height);
            gradient.addColorStop(0, '#266f72');
            gradient.addColorStop(0.4, '#63AEA8');
            gradient.addColorStop(0.6, '#63AEA8');
            gradient.addColorStop(1, '#266f72');
            this.gradient = gradient;
        }
        return this.gradient;
    }
    draw(context) {
        context.save();
        context.fillStyle = this.gradientFor(context);
        context.fillRect(
            0, 0,
            this.game.width, this.game.height
        );
        context.restore();

        // this.backgroundLayers.forEach(layer => {
        //     layer.draw(context);
        // })
    }
}

