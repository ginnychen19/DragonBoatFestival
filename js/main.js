import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { Spawner } from './spawner.js';
import { Sound } from './sound.js';

const canvas = document.getElementById("CanvasGame");
const ctx = canvas.getContext('2d');
const uiStart = document.getElementById('ui-start');
const uiPlay = document.getElementById('ui-play');
const uiGameOver = document.getElementById('ui-GameOver');
const progressBar = document.getElementById('ProgressBar');
const scoreEls = document.querySelectorAll('span.score'); //遊戲中與結算畫面各一個，一起更新
const evaluate = document.getElementById('evaluate');

const btnStartGame = document.querySelector('.button.start');
const btnRestartGame = document.querySelector('.button.reStart');
const btnPauseGame = document.querySelector('.btn.PauseGame');
const btnMusic = document.querySelector('button.music');
const musicToggle = document.getElementById('checkboxInput'); //遊戲中的喇叭開關，勾起來是靜音

window.addEventListener('load', function () {
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
            this.shownTime = -1;  //最後一次寫進進度條的秒數
            this.shownScore = -1; //最後一次寫進畫面的分數，數值有變才碰 DOM

            this.gameOver = false;
            this.gamePause = false;

            this.sound = new Sound();
        }
        /* 暫停切換：空白鍵與畫面上的暫停鈕都走這裡，按鈕圖示跟著狀態換 */
        togglePause() {
            this.gamePause = !this.gamePause;
            btnPauseGame.style.backgroundImage = `url('./assets/img/${this.gamePause ? 'btn-R' : 'btn-Stop'}.svg')`;
        }

        update(deltaTime) {
            if (!game.gamePause) { //按下暫停鍵
                //時間計數器：deltaTime 是毫秒，換成秒累加
                this.time += deltaTime / 1000;
                //進度條與分數：每幀都寫 DOM 會觸發不必要的 layout，數值有變才寫
                const second = Math.floor(this.time);
                if (second !== this.shownTime) {
                    this.shownTime = second;
                    progressBar.value = second;
                }
                if (this.score !== this.shownScore) {
                    this.shownScore = this.score;
                    scoreEls.forEach(el => { el.textContent = this.score; });
                }
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
        btnMusic.querySelector('.btn-txt').textContent = on ? '音樂：開' : '音樂：關';
        musicToggle.checked = !on;
    });
    btnMusic.addEventListener('click', () => game.sound.toggle());
    musicToggle.addEventListener('change', function () { game.sound.setEnabled(!this.checked); });
    /* 按下開始遊戲 */
    btnStartGame.addEventListener('click', function () {
        game.sound.playBgm(); //點擊屬於使用者互動，瀏覽器允許在這裡開始播放
        game.spawner.warmUp(); //開場先把河面填起來，不用空等第一列流下來
        uiStart.classList.add('hidden');
        uiPlay.classList.remove('hidden');
        requestAnimationFrame(animate);
    });

    /* 按下暫停 */
    btnPauseGame.addEventListener('click', () => game.togglePause());
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
            uiPlay.classList.add('hidden');
            uiGameOver.classList.remove('hidden');

            if (game.score <= 3) {
                evaluate.innerHTML = "恩🙂🙂🙂 <br>到底是誰在雷阿?";
            } else if (game.score <= 6) {
                evaluate.innerHTML = "👏加油👏<br>努力成為搶旗好手吧🚩";
            } else {
                evaluate.innerHTML = "💗天啊😍💗 <br> 你的走位太靈活了🚣";
            }
        }
    }
    /* 按下重新開始 */
    btnRestartGame.addEventListener('click', function () {
        location.reload(); // 重新載入視窗
    });
});
