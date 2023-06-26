import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { Rock, Flag } from './obstacle.js';

const canvas = document.getElementById("CanvasGame");
const gameUI = $(".gameUI");
const ctx = canvas.getContext('2d');
let uiStart = $("#ui-start");
let uiPlay = $("#ui-play");
let uiGameOver = $("#ui-GameOver");
let progressBar = $('#ProgressBar');
let score = $('span.score');
let evaluate = $('#evaluate');


let btnStartGame = $(".button.start");
let btnRestartGame = $(".button.reStart");
let btnPauseGame = $(".btn.PauseGame");

window.addEventListener('load', function () {
    canvas.width = 320;
    canvas.height = 625;
    calculateCanvasSize();

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.speed = 0;

            this.background = new Background(this)
            this.player = new Player(this);
            this.input = new InputHandler(this);

            this.obstacles = [];
            this.obstacleTimer = 0;
            this.obstacleInterval = 1000;

            this.debug = false;
            this.debugCount = 0;
            this.score = 0;
            this.time = 0;
            this.maxTime = 60;

            this.gameOver = false;
            this.gamePause = false;
            this.btnPauseGameCount = 0;
            this.gameBGmusic = false;

        }

        update(deltaTime) {
            if (!game.gamePause) {
                // var senced = deltaTime / 1000; //不知為何這樣算會有bug
                this.time += 0.006;
                progressBar.attr('value', Math.floor(this.time))
                score.html(this.score);

                if (this.time >= this.maxTime) this.gameOver = true;
                this.background.update();
                this.player.update(this.input.keys, deltaTime);

                if (this.obstacleTimer > this.obstacleInterval) {
                    this.addObstacle();
                    this.obstacleTimer = 0;
                } else {
                    this.obstacleTimer += deltaTime;
                }
                this.obstacles.forEach(obstacle => {
                    obstacle.update(deltaTime);
                    if (obstacle.markedForDeletion) this.obstacles.splice(this.obstacles.indexOf(obstacle), 1);//刪除當前這個障礙物
                })
            } else {
                return;
            }

        }
        draw(context) {
            this.background.draw(context);
            this.obstacles.forEach(obstacle => {
                obstacle.draw(context);
            })
            this.player.draw(context);
        }
        addObstacle() {
            if (window.innerWidth > 480) {
                if (Math.floor(this.time) % 2 === 0) {
                    this.obstacles.push(new Rock(this));
                }
            } else {
                this.obstacles.push(new Rock(this), new Rock(this), new Rock(this));
            }

            if (Math.floor(this.time) % 5 === 0) {
                this.obstacles.push(new Flag(this));
            }
        }
    }
    const game = new Game(canvas.width, canvas.height);
    $(btnStartGame).on('click', function () {
        uiStart.addClass("hidden");
        uiPlay.removeClass("hidden");
        animate(0);
    });
    $(btnPauseGame).on('click', function () {
        game.btnPauseGameCount++;
        if (game.btnPauseGameCount % 2 != 0) {
            btnPauseGame.css('background-image', "url('https://gotoo.co/demo/elizabeth/04_DragonBoatFestival/assest/img/btn-R.svg')")
            game.gamePause = true;
        } else {
            btnPauseGame.css('background-image', "url('https://gotoo.co/demo/elizabeth/04_DragonBoatFestival/assest/img/btn-Stop.svg')")
            game.gamePause = false;
        }
    });
    let lastime = 0;
    function animate(timeStamp) {
        if (!game.gameOver) {
            const deltaTime = timeStamp - lastime;
            lastime = timeStamp;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            game.update(deltaTime);
            game.draw(ctx);
            requestAnimationFrame(animate);
        }
        if (game.gameOver) {
            uiPlay.addClass("hidden");
            uiGameOver.removeClass("hidden");

            if (game.score <= 3) {
                evaluate.html("恩🙂🙂🙂 <br>到底是誰在雷阿?");
            } else if (game.score <= 6) {
                evaluate.html("👏加油👏<br>努力成為搶旗好手吧🚩");
            } else {
                evaluate.html("💗天啊😍💗 <br> 你的走位太靈活了🚣");
            }
        }
    }

    $(btnRestartGame).on('click', function () {
        location.reload();
    })
});

function calculateCanvasSize() {
    let windowHeight = window.innerHeight;
    let targetHeight = windowHeight;
    let targetWidth = targetHeight / 1.875;

    let scaleX = targetWidth / 320;
    let scaleY = targetHeight / 625;

    canvas.style.transform = 'scale(' + scaleX + ', ' + scaleY + ')';
    gameUI.attr("style", `transform:scale(${scaleX},${scaleY});`)
}

$(window).on('resize', function () {
    calculateCanvasSize();
});