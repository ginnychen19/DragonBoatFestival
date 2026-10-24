import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { Rock, Flag } from './obstacle.js';
// import { UI } from './UI.js';
// import { BgMusic, UiSound, playerSound } from './music.js';

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
let btnMusic = $("button.music");

let music_chinese01 = $("#music_chinese01");
let music_chinese02 = $("#music_chinese02");

window.addEventListener('load', function () {
    canvas.width = 320;
    canvas.height = 625;
    calculateCanvasSize();//計算canvas縮放

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.speed = 0; //影響整體畫面初始速度

            this.background = new Background(this)
            this.player = new Player(this);
            this.input = new InputHandler(this);

            this.obstacles = []; //障礙物生成
            this.obstacleTimer = 0;
            this.obstacleInterval = 1000;

            this.debug = false;
            this.debugCount = 0;
            this.score = 0;
            this.time = 0;
            this.maxTime = 60; //因為我後面把單位變成秒了，所以這邊單位要變

            this.gameOver = false;
            this.gamePause = false;
            this.btnPauseGameCount = 0;
            this.gameBGmusic = false;

            this.openMusic = false;
            this.btnMusicCount = 1;

            // this.player.currentState = this.player.states[0];
            // this.player.currentState.enter();

        }

        update(deltaTime) {
            if (!game.gamePause) { //按下暫停鍵
                //時間計數器
                // var senced = deltaTime / 1000; //不知為何這樣算會有bug
                this.time += 0.006;
                //進度條移動
                progressBar.attr('value', Math.floor(this.time))
                //分數
                score.html(this.score);
                //遊戲是否結束判斷
                if (this.time >= this.maxTime) this.gameOver = true;
                //遊戲背景
                this.background.update();
                this.player.update(this.input.keys, deltaTime);

                // console.log(this.openMusic);
                // 生成敵人
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
                this.obstacles.push(new Rock(this));
            }

            if (Math.floor(this.time) % 5 === 0) {//每5秒有一個旗子
                this.obstacles.push(new Flag(this));
            }
        }
    }
    const game = new Game(canvas.width, canvas.height);
    // if (game.openMusic) music_chinese01.Play();
    /* 按下開始遊戲 */
    $(btnStartGame).on('click', function () {
        // if (game.openMusic)
        // game.openMusic = true;
        // console.log(music_chinese02[0]);
        // if(game.openMusic) music_chinese02[0].Play();
        uiStart.addClass("hidden");
        uiPlay.removeClass("hidden");
        animate(0);
    });
    /* 音樂監聽 */
    $(btnMusic).on('click', function () {
        game.btnMusicCount++;
        if (game.btnMusicCount % 2 != 0) {
            game.gamePause = false;
            $("#music_chinese01").get(0).pause();
            // $("#music_chinese01").attr("autoplay", "true");
        } else {
            game.openMusic = true;
            $("#music_chinese01").get(0).play();
            // $("#music_chinese01").attr("autoplay", "false");
        }
    });

    /* 按下暫停 */
    $(btnPauseGame).on('click', function () {
        game.btnPauseGameCount++;
        if (game.btnPauseGameCount % 2 != 0) {
            console.log()
            btnPauseGame.css('background-image', "url('./assets/img/btn-R.svg')")
            game.gamePause = true;
        } else {
            btnPauseGame.css('background-image', "url('./assets/img/btn-Stop.svg')")
            game.gamePause = false;
        }
    });
    /* 動畫渲染 */
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
        /* 遊戲結束介面 */
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
    /* 按下重新開始 */
    $(btnRestartGame).on('click', function () {
        location.reload(); // 重新載入視窗
    })
});

function calculateCanvasSize() {
    let windowHeight = window.innerHeight;
    let targetHeight = windowHeight;
    let targetWidth = targetHeight / 1.875;

    // 计算缩放比例
    let scaleX = targetWidth / 320;
    let scaleY = targetHeight / 625;

    // 应用缩放变换
    canvas.style.transform = 'scale(' + scaleX + ', ' + scaleY + ')';
    gameUI.attr("style", `transform:scale(${scaleX},${scaleY});`)
}

$(window).on('resize', function () {
    calculateCanvasSize();
});