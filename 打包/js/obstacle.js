class obstacle {
    constructor() {
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
        this.speedY = 2;
    }
    update(deltaTime) {
        this.y += this.speedY;
        if (this.y + this.height > 625 + this.height) this.markedForDeletion = true;

    }
    draw(context) {
        context.save();//這個很重要喔
        if (this.game.debug) {
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI);
            context.fillStyle = 'blue';
            context.fill();
        }
        context.restore();

        context.drawImage(
            this.image,
            0,
            0,
            this.image.width,
            this.image.height,

            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

export class Rock extends obstacle {
    constructor(game) {
        super();
        this.game = game;
        this.width = Math.random() * 20 + 60; 
        this.height = this.width;
        this.x = Math.random() * (this.game.width - this.width);
        this.y = -(Math.random() * 40 + this.height);
        this.image = document.getElementById("rock01");
    }
    update(deltaTime) {
        super.update(deltaTime); 
    }
}
export class Flag extends obstacle {
    constructor(game) {
        super();
        this.game = game;
        this.width = 40;
        this.height = this.width;
        this.image = document.getElementById("flag");
        this.generatePosition();
    }

    generatePosition() {
        this.x = Math.random() * (this.game.width - this.width);
        this.y = -(Math.random() * 40 + this.height);
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.checkCollisionWithPreviousRock();
    }

    checkCollisionWithPreviousRock() {
        const obstacles = this.game.obstacles;
        const index = obstacles.indexOf(this);

        if (index > 0) {
            const previousRock = obstacles[index - 1];

            if (
                this.x < previousRock.x + previousRock.width &&
                this.x + this.width > previousRock.x
            ) {
                this.generatePosition();
            }
        }
    }
}
