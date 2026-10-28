import { Rock, Flag, FLAG_SIZE, tierFor } from './obstacle.js';

/* 列式生成：每隔 rowTime 秒生成一列。
   先決定這列的「通道」位置，礁石只放在通道以外且彼此不重疊，旗子放在通道內。
   相鄰兩列的通道位移不超過船在一列時間內能移動的距離，所以永遠有路可走、旗子永遠撿得到。 */
const GAP_WIDTH = 90;          //通道寬度（px）。船的碰撞框 32 寬，留兩側餘裕
const GAP_SHIFT_SAFETY = 0.8;  //通道位移只用船可移動距離的 8 成，留反應時間
const FLAG_EVERY = 3;          //每幾列放一面旗子
const MOBILE_ROW_FACTOR = 0.6; //手機船速快，列間距縮短，維持原本較密的節奏
const MOBILE_MAX_WIDTH = 480;
const ROW_Y_JITTER = 20;       //同一列的礁石上下錯開一點，不要排成直線
const PLACE_TRIES = 12;        //礁石找不重疊位置的嘗試次數
const WARM_UP_MAX_SECONDS = 10; //開場快轉的上限秒數（實際由 WARM_UP_SAFE_GAP 決定何時停）
const WARM_UP_SAFE_GAP = 120;   //快轉停在最下面一列的底部離船還有這麼多 px，第一檔流速下約 1 秒到船邊
const WARM_UP_STEP_MS = 16;     //快轉的模擬步長

export class Spawner {
    constructor(game) {
        this.game = game;
        this.progress = 0;                 //距離上一列經過的秒數
        this.gapX = game.width / 2;        //目前通道中心，船一開始在正中間
        this.rows = 0;                     //已生成的列數，用來決定旗子
        this.centerNextRow = false;        //下一列的通道強制對準畫面中央（開場用）
    }
    rowTime() {
        const base = tierFor(this.game.time).rowTime;
        return window.innerWidth < MOBILE_MAX_WIDTH ? base * MOBILE_ROW_FACTOR : base;
    }
    /* 船在一列時間內能移動的距離，決定通道最多能偏多遠 */
    maxGapShift() {
        return this.game.player.maxSpeed * this.rowTime() * GAP_SHIFT_SAFETY;
    }
    update(deltaTime) {
        this.progress += deltaTime / 1000;
        if (this.progress < this.rowTime()) return;
        this.progress = 0;
        this.spawnRow();
    }
    /* 開場快轉：只跑生成與流動，不畫、不算玩家、不動遊戲時間。
       列距與通道限制全部沿用一般規則，所以開場畫面和進行中一樣自然。
       停止條件是「最下面一列的底部離船還有 WARM_UP_SAFE_GAP」，不是固定秒數，
       這樣桌機與手機（列距不同）都剛好填滿畫面又不會壓到船；最先遇到的那列通道對準船 */
    warmUp() {
        const game = this.game;
        const stopY = game.player.y - WARM_UP_SAFE_GAP;
        this.centerNextRow = true;
        for (let elapsed = 0; elapsed < WARM_UP_MAX_SECONDS * 1000; elapsed += WARM_UP_STEP_MS) {
            this.update(WARM_UP_STEP_MS);
            game.obstacles.forEach(obstacle => obstacle.update(WARM_UP_STEP_MS));
            const lowestBottom = Math.max(...game.obstacles.map(o => o.y + o.height), -Infinity);
            if (lowestBottom >= stopY) break;
        }
        game.obstacles = game.obstacles.filter(obstacle => !obstacle.markedForDeletion);
    }
    spawnRow() {
        const game = this.game;
        const tier = tierFor(game.time);
        const half = GAP_WIDTH / 2;

        //通道：從上一列的位置偏移，夾在畫面內；開場第一列直接對準中央，船一開始就在那裡
        if (this.centerNextRow) {
            this.gapX = game.width / 2;
            this.centerNextRow = false;
        } else {
            const shift = (Math.random() * 2 - 1) * this.maxGapShift();
            this.gapX = Math.min(Math.max(this.gapX + shift, half), game.width - half);
        }

        //礁石：通道以外，彼此不重疊
        const placed = [];
        for (let i = 0; i < tier.rocks; i++) {
            const size = Rock.randomSize();
            const x = this.findRockX(size, placed);
            if (x === null) break; //這列塞不下就少放一顆
            const rock = new Rock(game, x, -size - Math.random() * ROW_Y_JITTER, size);
            placed.push(rock);
            game.obstacles.push(rock);
        }

        //旗子：放在通道內，稍微左右偏一點
        this.rows++;
        if (this.rows % FLAG_EVERY === 0) {
            const slack = half - FLAG_SIZE / 2;
            const x = this.gapX - FLAG_SIZE / 2 + (Math.random() * 2 - 1) * slack;
            game.obstacles.push(new Flag(game, x, -FLAG_SIZE));
        }
    }
    /* 在通道兩側的空間裡找一個放得下、且不與已放礁石重疊的 x；找不到回傳 null */
    findRockX(size, placed) {
        const half = GAP_WIDTH / 2;
        const regions = [
            [0, this.gapX - half],
            [this.gapX + half, this.game.width],
        ].filter(([from, to]) => to - from >= size);
        if (regions.length === 0) return null;

        for (let i = 0; i < PLACE_TRIES; i++) {
            const [from, to] = regions[Math.floor(Math.random() * regions.length)];
            const x = from + Math.random() * (to - from - size);
            const overlaps = placed.some(p => x < p.x + p.width && x + size > p.x);
            if (!overlaps) return x;
        }
        return null;
    }
}
