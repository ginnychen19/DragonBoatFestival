// import { Sitting, Running, Jumping, Falling, Death } from './playerStates.js';
import { Rock, Flag } from './obstacle.js';
const canvas = document.getElementById("CanvasGame");
/* 手感參數，單位皆為「每秒」，不受螢幕更新率影響。數值以舊版在 60fps 的表現為基準換算 */
const TUNING = {
    desktop: { maxSpeed: 60, rotationSpeed: 60, maxRotate: 30 },
    mobile: { maxSpeed: 120, rotationSpeed: 120, maxRotate: 45 },
};
//這邊的this = Player這個class ，也就是操控角色。
export class Player {
    constructor(game) {
        this.game = game;
        this.width = 320;
        this.height = 625;
        this.boatWidth = 32;
        this.boatHeight = 50;
        this.x = (this.width - this.boatWidth) / 2;
        this.y = (this.height - this.boatHeight) - 60; //從底下高60
        this.rotate = 0; //目前船身角度（度）
        this.applyTuning();
        this.image = document.getElementById("PlayerBoat");

        this.frameX = 0; //這邊是用來畫精靈圖。
        this.frameY = 0; //決定動作狀態。  
        this.maxframe; //決定動作狀態。 

        this.fps = 15; //這邊影響動畫看起來的速度。
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0; //以上三個用來計數動畫

        this.speed = 0; //目前水平速度（px/s）
        // this.states = [//這邊會放playerStates.js的各種狀態。
        //     new Sitting(this),
        //     new Running(this),
        //     new Jumping(this),
        //     new Falling(this),
        //     new Death(this),
        // ];
        // this.currentState = this.states[0];
        // this.currentState.enter();

        // this.playerSound = new playerSound(this.game);//玩家動作音樂
        // this.EnemySound = new EnemySound(this.game);//敵人碰撞音樂
    }
    applyTuning() {
        const t = window.innerWidth < 480 ? TUNING.mobile : TUNING.desktop;
        this.maxSpeed = t.maxSpeed;           // px/s
        this.rotationSpeed = t.rotationSpeed; // 度/s
        this.maxRotate = t.maxRotate;         // 度
    }
    update(input, deltaTime) {
        const dt = deltaTime / 1000; //秒
        this.checkCollision();
        this.applyTuning();
        this.x += this.speed * dt;
        /* 沒按鍵時船身慢慢回正，回正速度是轉向速度的一半 */
        if (this.rotate !== 0) {
            const settle = Math.min(Math.abs(this.rotate), this.rotationSpeed / 2 * dt);
            this.rotate -= Math.sign(this.rotate) * settle;
        }
        if (input.includes('arrowright')) {
            this.speed = this.maxSpeed;
            this.rotate = Math.min(this.rotate + this.rotationSpeed * dt, this.maxRotate);
        } else if (input.includes('a')) {
            this.speed = -this.maxSpeed;
            this.rotate = Math.max(this.rotate - this.rotationSpeed * dt, -this.maxRotate);
        } else { this.speed = 0; }
        /* 牆壁判斷 */
        if (this.x < 0) this.x = 0;
        if (this.x > this.width - this.boatWidth) this.x = this.width - this.boatWidth;
        /* 最大旋轉範圍 */
        
        // //畫動態圖
        // if (this.frameTimer > this.frameInterval) {
        //     this.frameTimer = 0;
        //     if (this.frameX < this.maxframe) this.frameX++;
        //     else this.frameX = 0;
        // } else {
        //     this.frameTimer += deltaTime;
        //     //這時可能會發現動態有少，所以我們在playerStates加入maxframe的值！
        // }
    }

    draw(context) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        /* (this.x+this.boatWidth/2),(this.y+this.boatHeight/2) */
        context.translate((this.x + this.boatWidth / 2), (this.y + this.boatHeight / 2));
        context.rotate(this.rotate * Math.PI / 180); // 将角度转换为弧度并进行旋转
        if (this.game.debug) {
            context.fillRect(
                -this.boatWidth / 2,
                -this.boatHeight / 2,
                this.boatWidth, //修改碰撞器高寬
                this.boatHeight
            );
        }
    
        /* 畫圖片 */
        context.drawImage(
            this.image,

            0, 0,
            this.image.width,
            this.image.height,

            -this.boatWidth /2 -11, -this.boatHeight/2 -30 ,
            54, 84
        );
        context.setTransform(1, 0, 0, 1, 0, 0);
        // context.fillRect(
        //     150,
        //     150,
        //     this.boatWidth, //修改碰撞器高寬
        //     this.boatHeight
        // );
        
    }
    setState(state, speed) {
        //把從playerStates.js接收到的狀態內容換到這裡
        // this.currentState = this.states[state];//這是啥意思?
        // this.game.speed = speed; //要加speed是因為這樣我們才可以在playerStates.js中，設定當我們是哪個動作時，畫面移動的速度要是0或正常。
        // this.currentState.enter();
    }
    /* 船是會旋轉的矩形，障礙物是圓。把圓心轉進「以船中心為原點、跟著船旋轉」的局部座標，
       矩形就變回不旋轉的 (-w/2, -h/2, w, h)，再用最近點到圓心的距離判定。
       軸心必須是船的中心，和 draw() 的 translate/rotate 一致，碰撞框才會跟畫面對齊。 */
    checkCollision() {
        const halfW = this.boatWidth / 2;
        const halfH = this.boatHeight / 2;
        const centerX = this.x + halfW;
        const centerY = this.y + halfH;
        const rad = -this.rotate * Math.PI / 180; //反向旋轉，把世界座標轉進船的局部座標
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        this.game.obstacles.forEach(obstacle => {
            const radius = obstacle.width / 2;
            const dx = obstacle.x + radius - centerX;
            const dy = obstacle.y + obstacle.height / 2 - centerY;
            const localX = cos * dx - sin * dy;
            const localY = sin * dx + cos * dy;
            //矩形上離圓心最近的點
            const closestX = Math.max(-halfW, Math.min(localX, halfW));
            const closestY = Math.max(-halfH, Math.min(localY, halfH));
            const distX = localX - closestX;
            const distY = localY - closestY;
            if (distX * distX + distY * distY > radius * radius) return; //沒碰到

            if (obstacle instanceof Flag) {
                obstacle.markedForDeletion = true;
                this.game.score++;
                this.game.sound.play('collect');
            } else if (obstacle instanceof Rock) {
                this.game.gameOver = true;
                this.game.sound.play('fail');
                document.body.classList.add('shake');
            }
        });
    }
}
