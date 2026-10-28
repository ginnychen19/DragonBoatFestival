/* 難度分檔：遊戲進行到第 from 秒以後套用。由高到低排列，取第一個符合的。
   speed      流速（px/s）
   spawnEvery 河流每捲動多少 px 生一顆礁石；用距離不用時間，流速變快畫面密度不會變稀 */
export const TIERS = [
    { from: 40, speed: 360, spawnEvery: 150 },
    { from: 20, speed: 180, spawnEvery: 170 },
    { from: 0, speed: 120, spawnEvery: 200 },
];
export function tierFor(time) {
    return TIERS.find(t => time >= t.from);
}

const ROCK_BASE_SIZE = 70;
const ROCK_SCALE_MIN = 0.8;
const ROCK_SCALE_MAX = 1.2;
export const FLAG_SIZE = 40;

class obstacle {
    constructor(game, x, y, size) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.markedForDeletion = false;
        this.speedY = tierFor(0).speed; //流速（px/s）
    }
    update(deltaTime) {
        this.speedY = tierFor(this.game.time).speed;
        this.y += this.speedY * deltaTime / 1000;
        //移出畫面底部就擦除
        if (this.y > this.game.height) this.markedForDeletion = true;
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
    /* 大小在基準尺寸的 0.8–1.2 倍之間隨機 */
    static randomSize() {
        return ROCK_BASE_SIZE * (ROCK_SCALE_MIN + Math.random() * (ROCK_SCALE_MAX - ROCK_SCALE_MIN));
    }
    constructor(game, x, y, size = Rock.randomSize()) {
        super(game, x, y, size);
        this.image = document.getElementById("rock01");
    }
}

export class Flag extends obstacle {
    constructor(game, x, y) {
        super(game, x, y, FLAG_SIZE);
        this.image = document.getElementById("flag");
    }
}
