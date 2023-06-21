import { Rock, Flag } from './obstacle.js';
const canvas = document.getElementById("CanvasGame");

export class Player {
    constructor(game) {
        this.game = game;
        this.width = 320;
        this.height = 625;
        this.boatWidth = 32;
        this.boatHeight = 50;
        this.x = (this.width - this.boatWidth) / 2;
        this.y = (this.height - this.boatHeight) - 60;
        this.rotate = 0
        this.rotationSpeed = 1;
        this.image = document.getElementById("PlayerBoat");

        this.fps = 15;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.speed = 0;
        this.maxSpeed = 1;

        this.btnLeft = $('button.left');
        this.btnRight = $('button.right');
    }
    update(input, deltaTime) {
        this.checkCollision();
        this.x += this.speed;

        if (this.rotate != 0) {
            if (this.rotate < 0) {
                this.rotate = this.rotate + this.rotationSpeed / 2;
            } else if (this.rotate > 0) {
                this.rotate = this.rotate - this.rotationSpeed / 2;
            }
        }
        if (input.includes('arrowright')) {
            this.speed = this.maxSpeed;
            if (this.rotate < 30) this.rotate += this.rotationSpeed;
        }
        else if (input.includes('a')) {
            this.speed = -this.maxSpeed;
            if (this.rotate > -30) this.rotate -= this.rotationSpeed;

        } else { this.speed = 0; }

        if (this.x < 0) this.x = 0;
        if (this.x > this.width - this.boatWidth) this.x = this.width - this.boatWidth;

    }

    draw(context) {
        context.setTransform(1, 0, 0, 1, 0, 0);

        context.translate((this.x + this.boatWidth / 2), (this.y + this.boatHeight / 2));
        context.rotate(this.rotate * Math.PI / 180);
        if (this.game.debug) {
            context.fillRect(
                -this.boatWidth / 2,
                -this.boatHeight / 2,
                this.boatWidth,
                this.boatHeight
            );
        }

        context.drawImage(
            this.image,

            0, 0,
            this.image.width,
            this.image.height,

            -this.boatWidth / 2 - 11, -this.boatHeight / 2 - 30,
            54, 84
        );
        context.setTransform(1, 0, 0, 1, 0, 0);


    }
    setState(state, speed) {
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
                } else if (obstacle instanceof Rock) {
                    this.game.gameOver = true;
                    $('body').addClass('shake');
                }
            }
        });
    }
}

