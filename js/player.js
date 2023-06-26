// import { Sitting, Running, Jumping, Falling, Death } from './playerStates.js';
import { Rock, Flag } from './obstacle.js';
// import { playerSound, EnemySound } from './music.js';
const canvas = document.getElementById("CanvasGame");
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
        this.rotate = 0
        this.rotationSpeed = 1;
        this.maxRotate = 30;
        this.image = document.getElementById("PlayerBoat");

        this.frameX = 0; //這邊是用來畫精靈圖。
        this.frameY = 0; //決定動作狀態。  
        this.maxframe; //決定動作狀態。 

        this.fps = 15; //這邊影響動畫看起來的速度。
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0; //以上三個用來計數動畫

        this.speed = 0;
        this.maxSpeed = 1;//控制移動速度
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
    this.btnLeft = $('button.left');
        this.btnRight = $('button.right');
    }
    update(input, deltaTime) {
        this.checkCollision();
        // this.currentState.handleInput(input);//在每次更新前先檢查狀態
        this.x += this.speed;
        if (window.innerWidth < 480) {
            this.maxSpeed = 2;
            this.rotationSpeed = 2;
            this.maxRotate = 45;
        }
        if (this.rotate != 0) {
            if (this.rotate < 0) {
                this.rotate = this.rotate + this.rotationSpeed / 2;
            } else if (this.rotate > 0) {
                this.rotate = this.rotate - this.rotationSpeed / 2;
            }
        }
        if (input.includes('arrowright')) {
            this.speed = this.maxSpeed; // 向右旋转
            if(this.rotate< this.maxRotate ) this.rotate += this.rotationSpeed;//最多轉幾度
        }
        else if (input.includes('a')) {
            this.speed = -this.maxSpeed;
            if(this.rotate > -this.maxRotate) this.rotate -= this.rotationSpeed; // 向左旋转

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
    checkCollision() {
        this.game.obstacles.forEach(obstacle => {
            // 矩形的位置和尺寸
            const rectX = this.x;
            const rectY = this.y;
            const rectWidth = this.boatWidth;
            const rectHeight = this.boatHeight;
            // 圓形的位置和半徑
            const circleX = obstacle.x + obstacle.width / 2;
            const circleY = obstacle.y + obstacle.height / 2;
            const circleRadius = obstacle.width / 2;
            // 將畫布逆時針旋轉矩形的旋轉角度
            const rotatedRectX = Math.cos(-this.rotate * Math.PI / 180) * (rectX - this.x) - Math.sin(-this.rotate * Math.PI / 180) * (rectY - this.y) + this.x;
            const rotatedRectY = Math.sin(-this.rotate * Math.PI / 180) * (rectX - this.x) + Math.cos(-this.rotate * Math.PI / 180) * (rectY - this.y) + this.y;
            // 將畫布逆時針旋轉圓形的位置
            const rotatedCircleX = Math.cos(-this.rotate * Math.PI / 180) * (circleX - this.x) - Math.sin(-this.rotate * Math.PI / 180) * (circleY - this.y) + this.x;
            const rotatedCircleY = Math.sin(-this.rotate * Math.PI / 180) * (circleX - this.x) + Math.cos(-this.rotate * Math.PI / 180) * (circleY - this.y) + this.y;
            // 使用旋轉後的矩形和圓形位置進行碰撞檢測
            const closestX = Math.max(rotatedRectX, Math.min(rotatedCircleX, rotatedRectX + rectWidth));
            const closestY = Math.max(rotatedRectY, Math.min(rotatedCircleY, rotatedRectY + rectHeight));
            // 計算最近點和圓心的距離
            const distanceX = rotatedCircleX - closestX;
            const distanceY = rotatedCircleY - closestY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            // 如果距離小於等於圓的半徑，表示碰撞發生
            if (distance <= circleRadius) {
                // 在這裡處理碰撞的邏輯
                
                if (obstacle instanceof Flag) {
                    obstacle.markedForDeletion = true;
                    this.game.score++;
                    // this.EnemySound.Playmusic(0);
                } else if (obstacle instanceof Rock) {
                    this.game.gameOver = true;
                    $('body').addClass('shake');
                        // this.setState(4, 0);
                        // setTimeout(() => {
                        //     this.game.gameOver = true;
                        // }, 700);//因為死亡動畫撥一次完大概是700毫秒
                    
                }
                // console.log('Collision detected!');
            }
        });
    }
}



    // checkCollision() {
    //     this.game.obstacles.forEach(obstacle => {
    //         // 矩形的位置和尺寸
    //         const rectX = this.x;
    //         const rectY = this.y;
    //         const rectWidth = this.boatWidth;
    //         const rectHeight = this.boatHeight;
    //         // 圓形的位置和半徑
    //         const circleX = obstacle.x + obstacle.width / 2;
    //         const circleY = obstacle.y + obstacle.height / 2;
    //         const circleRadius = obstacle.width / 2;
    //         // 將畫布逆時針旋轉矩形的旋轉角度
    //         const rotatedRectX = Math.cos(-this.rotate * Math.PI / 180) * (rectX - this.x) - Math.sin(-this.rotate * Math.PI / 180) * (rectY - this.y) + this.x;
    //         const rotatedRectY = Math.sin(-this.rotate * Math.PI / 180) * (rectX - this.x) + Math.cos(-this.rotate * Math.PI / 180) * (rectY - this.y) + this.y;
    //         // 將畫布逆時針旋轉圓形的位置
    //         const rotatedCircleX = Math.cos(-this.rotate * Math.PI / 180) * (circleX - this.x) - Math.sin(-this.rotate * Math.PI / 180) * (circleY - this.y) + this.x;
    //         const rotatedCircleY = Math.sin(-this.rotate * Math.PI / 180) * (circleX - this.x) + Math.cos(-this.rotate * Math.PI / 180) * (circleY - this.y) + this.y;
    //         // 使用旋轉後的矩形和圓形位置進行碰撞檢測
    //         const closestX = Math.max(rotatedRectX, Math.min(rotatedCircleX, rotatedRectX + rectWidth));
    //         const closestY = Math.max(rotatedRectY, Math.min(rotatedCircleY, rotatedRectY + rectHeight));
    //         // 計算最近點和圓心的距離
    //         const distanceX = rotatedCircleX - closestX;
    //         const distanceY = rotatedCircleY - closestY;
    //         const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    //         // 如果距離小於等於圓的半徑，表示碰撞發生
    //         if (distance <= circleRadius) {
    //             // 在這裡處理碰撞的邏輯
    //             this.game.gameOver = true;
                
    //         }
    //     });
    // }