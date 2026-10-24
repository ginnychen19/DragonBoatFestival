/* 流速分檔：遊戲進行到第 from 秒以後用 speed（px/s）。由高到低排列，取第一個符合的 */
const SPEED_TIERS = [
    { from: 40, speed: 360 },
    { from: 20, speed: 180 },
    { from: 0, speed: 120 },
];
function speedFor(time) {
    return SPEED_TIERS.find(t => time >= t.from).speed;
}

class obstacle {
    constructor() {
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
        this.speedY = speedFor(0); //流速（px/s）
    }
    update(deltaTime, nowTime) {
        //依遊戲進行秒數分檔加速
        this.speedY = speedFor(nowTime);
        //移動時
        this.y += this.speedY * deltaTime / 1000;
        //確認是否移出是窗外，移出擦除。
        if (this.y + this.height > 625 + this.height) this.markedForDeletion = true;

    }
    draw(context) {
        context.save();//這個很重要喔
        if (this.game.debug) {
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI);
            context.fillStyle = 'blue';
            context.fill();
            // context.strokeRect(
            //     this.x,
            //     this.y,
            //     this.width, //修改碰撞器高寬
            //     this.height
            // );
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
        this.width = Math.random() * 20 + 60; //石頭的大小(80~60)
        this.height = this.width;
        this.x = Math.random() * (this.game.width - this.width);//船的寬this.boatWidth
        this.y = -(Math.random() * 40 + this.height);//因為要從最上開始，有的推遠、推近生成。(-100~-60)
        this.image = document.getElementById("rock01");
    }
    update(deltaTime) {
        super.update(deltaTime, this.game.time);//super是再取用上面的funtion
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
        super.update(deltaTime, this.game.time);
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
                // Flag 和前一個 Rock 有重疊，需要重新生成位置
                this.generatePosition();
            }
        }
    }
}

// export class Flag extends obstacle {
//     constructor(game, rockX, rockWidth) {
//         super();
//         this.game = game;
//         this.width = 40; //旗子的大小(80~60)
//         this.height = this.width;
//         this.x = Math.random() * (this.game.width - this.width);//船的寬this.boatWidth
//         this.y = -(Math.random() * 40 + this.height);//因為要從最上開始，有的推遠、推近生成。(-100~-60)
//         this.image = document.getElementById("flag");

//     }


//     update(deltaTime) {
//         super.update(deltaTime); //super是再取用上面的funtion
//     }
// }