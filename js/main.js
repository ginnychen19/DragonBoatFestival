import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { Spawner } from './spawner.js';
import { Sound } from './sound.js';

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
let musicToggle = $("#checkboxInput"); //遊戲中的喇叭開關，勾起來是靜音

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

            this.obstacles = []; //場上的礁石與旗子
            this.spawner = new Spawner(this); //一列一列生成礁石與旗子

            this.debug = false;
            this.debugCount = 0;
            this.score = 0;
            this.time = 0;
            this.maxTime = 60; //秒

            this.gameOver = false;
            this.gamePause = false;
            this.btnPauseGameCount = 0;

            this.sound = new Sound();
        }

        update(deltaTime) {
            if (!game.gamePause) { //按下暫停鍵
                //時間計數器：deltaTime 是毫秒，換成秒累加
                this.time += deltaTime / 1000;
                //進度條移動
                progressBar.attr('value', Math.floor(this.time))
                //分數
                score.html(this.score);
                //遊戲是否結束判斷
                if (this.time >= this.maxTime) {
                    this.gameOver = true;
                    this.sound.play('win');
                }
                //遊戲背景
                this.background.update();
                this.player.update(this.input.keys, deltaTime);

                // 生成障礙物
                this.spawner.update(deltaTime);
                this.obstacles.forEach(obstacle => obstacle.update(deltaTime));
                this.obstacles = this.obstacles.filter(obstacle => !obstacle.markedForDeletion); //移出畫面或被撿走的清掉
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
    }
    const game = new Game(canvas.width, canvas.height);
    /* 音效開關：開始畫面的按鈕與遊戲中的喇叭共用同一個狀態，任一處切換另一處跟著變 */
    game.sound.onChange(on => {
        btnMusic.find('.btn-txt').text(on ? '音樂：開' : '音樂：關');
        musicToggle.prop('checked', !on);
    });
    btnMusic.on('click', () => game.sound.toggle());
    musicToggle.on('change', function () { game.sound.setEnabled(!this.checked); });
    /* 按下開始遊戲 */
    btnStartGame.on('click', function () {
        game.sound.playBgm(); //點擊屬於使用者互動，瀏覽器允許在這裡開始播放
        uiStart.addClass("hidden");
        uiPlay.removeClass("hidden");
        requestAnimationFrame(animate);
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
    let lastime = null;
    const MAX_DELTA = 100; //毫秒。分頁切走再切回時 rAF 會停，避免一次補上整段空白時間
    function animate(timeStamp) {
        if (!game.gameOver) {
            if (lastime === null) lastime = timeStamp; //第一幀只校正基準時間，不累加
            const deltaTime = Math.min(timeStamp - lastime, MAX_DELTA);
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