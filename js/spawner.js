import { Rock, Flag, FLAG_SIZE, tierFor } from './obstacle.js';

/* 逐顆生成：河流每捲動 spawnEvery px 生一顆礁石，放在「通道」的左側或右側。
   通道中心每次生成時隨機漫步一點，位移上限是船在這段捲動時間內能移動的距離，
   所以永遠有路可走、旗子永遠撿得到。
   用距離不用時間：流速變快時畫面上的礁石密度不變，難度差只在反應時間。 */
const GAP_WIDTH = 90;           //通道寬度（px）。船的碰撞框 32 寬，留兩側餘裕
const GAP_SHIFT_SAFETY = 0.8;   //通道位移只用船可移動距離的 8 成，留反應時間
const FLAG_EVERY = 5;           //每幾顆礁石放一面旗子
const SPACING_JITTER = 0.2;     //觸發距離隨機 ±20%，間距不等距才不像排隊；最小 0.8×150=120px 仍大於最大礁石 84px，同側不會疊
const WARM_UP_MAX_SECONDS = 10; //開場快轉的上限秒數（實際由 WARM_UP_SAFE_GAP 決定何時停）
const WARM_UP_SAFE_GAP = 120;   //快轉停在最下面一顆的底部離船還有這麼多 px，第一檔流速下約 1 秒到船邊
const WARM_UP_STEP_MS = 16;     //快轉的模擬步長

export class Spawner {
    constructor(game) {
        this.game = game;
        this.progress = 0;                 //上一顆生成後河流捲動的距離（px）
        this.nextAt = tierFor(0).spawnEvery; //下一顆的觸發距離；建構時 game.time 還沒設定，先用第一檔的固定值
        this.gapX = game.width / 2;        //目前通道中心，船一開始在正中間
        this.count = 0;                    //已生成的顆數，用來決定旗子
        this.centerNextSpawn = false;      //下一顆的通道強制對準畫面中央（開場用）
    }
    spacing() {
        return tierFor(this.game.time).spawnEvery * (1 + (Math.random() * 2 - 1) * SPACING_JITTER);
    }
    /* 河流捲動 dist px 所需的時間內，船能移動的距離；決定通道這次最多能偏多遠 */
    maxGapShift(dist = this.nextAt) {
        const seconds = dist / tierFor(this.game.time).speed;
        return this.game.player.maxSpeed * seconds * GAP_SHIFT_SAFETY;
    }
    update(deltaTime) {
        this.progress += tierFor(this.game.time).speed * deltaTime / 1000;
        if (this.progress < this.nextAt) return;
        this.progress = 0;
        this.spawn();
        this.nextAt = this.spacing();
    }
    /* 開場快轉：只跑生成與流動，不畫、不算玩家、不動遊戲時間。
       停止條件是「最下面一顆的底部離船還有 WARM_UP_SAFE_GAP」，不是固定秒數；最先遇到的那顆通道對準船 */
    warmUp() {
        const game = this.game;
        const stopY = game.player.y - WARM_UP_SAFE_GAP;
        this.centerNextSpawn = true;
        for (let elapsed = 0; elapsed < WARM_UP_MAX_SECONDS * 1000; elapsed += WARM_UP_STEP_MS) {
            this.update(WARM_UP_STEP_MS);
            game.obstacles.forEach(obstacle => obstacle.update(WARM_UP_STEP_MS));
            const lowestBottom = Math.max(...game.obstacles.map(o => o.y + o.height), -Infinity);
            if (lowestBottom >= stopY) break;
        }
        game.obstacles = game.obstacles.filter(obstacle => !obstacle.markedForDeletion);
    }
    spawn() {
        const game = this.game;
        const half = GAP_WIDTH / 2;

        //通道：從上一次的位置偏移，夾在畫面內；開場第一顆直接對準中央，船一開始就在那裡
        if (this.centerNextSpawn) {
            this.gapX = game.width / 2;
            this.centerNextSpawn = false;
        } else {
            const shift = (Math.random() * 2 - 1) * this.maxGapShift();
            this.gapX = Math.min(Math.max(this.gapX + shift, half), game.width - half);
        }

        //礁石：通道左側或右側隨機放一顆
        const size = Rock.randomSize();
        const x = this.findRockX(size);
        if (x !== null) game.obstacles.push(new Rock(game, x, -size, size));

        //旗子：放在通道內，稍微左右偏一點
        this.count++;
        if (this.count % FLAG_EVERY === 0) {
            const slack = half - FLAG_SIZE / 2;
            const fx = this.gapX - FLAG_SIZE / 2 + (Math.random() * 2 - 1) * slack;
            game.obstacles.push(new Flag(game, fx, -FLAG_SIZE));
        }
    }
    /* 在通道兩側中隨機選一側放得下的，回傳礁石的 x；兩側都放不下回傳 null */
    findRockX(size) {
        const half = GAP_WIDTH / 2;
        const sides = [
            [0, this.gapX - half],
            [this.gapX + half, this.game.width],
        ].filter(([from, to]) => to - from >= size);
        if (sides.length === 0) return null;
        const [from, to] = sides[Math.floor(Math.random() * sides.length)];
        return from + Math.random() * (to - from - size);
    }
}
