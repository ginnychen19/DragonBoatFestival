/* 遊戲真正會用到的按鍵，其他按鍵（F5、F12、Ctrl+R…）不攔截，交還給瀏覽器 */
const GAME_KEYS = new Set(['a', 'arrowright', ' ', 'q']);

export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = [];
        this.btnPlay = $('button.play');
        this.btnLeft = $('button.left');
        this.btnRight = $('button.right');
        this.btnStop = $('button.PauseGame');
        //因為會預先執行，所以把監聽放在這
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        //切到別的視窗時收不到 keyup，回來船會卡在持續移動，所以失焦時全部放開
        window.addEventListener('blur', this.releaseAll.bind(this));
        this.btnPlay.on('touchstart mousedown', this.BtnMousedown.bind(this));
        this.btnPlay.on('touchend touchcancel mouseup', this.BtnMouseup.bind(this));
    }
    releaseAll() {
        this.keys = [];
        this.btnLeft.removeClass("playhover");
        this.btnRight.removeClass("playhover");
    }
    handleKeyDown(e) {
        if (!GAME_KEYS.has(e.key.toLowerCase())) return;
        e.preventDefault();

        if (e.key.toLowerCase() === 'a') this.btnLeft.addClass("playhover");
        if (e.key === 'ArrowRight') this.btnRight.addClass("playhover");
        
        if (
            e.key.toLowerCase() === 'a' ||
            e.key === 'ArrowRight'
        ) {
            if (!this.keys.includes(e.key.toLowerCase())) {
                this.keys.push(e.key.toLowerCase());
            }
        } else if (e.key === " ") {
            this.game.btnPauseGameCount++;
            if (this.game.btnPauseGameCount % 2 != 0) {
                this.game.gamePause = true;
                this.btnStop.css('background-image', "url('./assets/img/btn-R.svg')")
            } else {
                this.game.gamePause = false;
                this.btnStop.css('background-image', "url('./assets/img/btn-Stop.svg')")
            }
        } else if (e.key.toLowerCase() === "q") {
            this.game.debugCount++;
            if (this.game.debugCount % 2 != 0) {
                this.game.debug = true;
            } else {
                this.game.debug = false;
            }
        }
    }

    handleKeyUp(e) {
        if (!GAME_KEYS.has(e.key.toLowerCase())) return;
        e.preventDefault();
        if (
            e.key.toLowerCase() === 'a' ||
            e.key === 'ArrowRight'
        ) {
            const index = this.keys.indexOf(e.key.toLowerCase());
            if (index !== -1) {
                this.keys.splice(index, 1);
            }
        }
        if (e.key.toLowerCase() === 'a') this.btnLeft.removeClass("playhover");
        if (e.key === 'ArrowRight') this.btnRight.removeClass("playhover");
    }
    BtnMousedown(e) {
        e.preventDefault();
        /* 轉換成純文字 */
        let btnKey = $(e.target).attr('class').replace(/\s/g, '').replace('play', '')
        $(e.target).addClass("playhover");
        if (
            btnKey.includes('left') ||
            btnKey.includes('right')
        ) {
            if (btnKey === 'left') btnKey = 'a';
            if (btnKey === 'right') btnKey = 'arrowright';
            this.keys.push(btnKey);
            // console.log(this.keys);
        }
    }

    BtnMouseup(e) {
        e.preventDefault();
        $(e.target).removeClass("playhover");
        let btnKey = $(e.target).attr('class').replace(/\s/g, '').replace('play', '');
        if (
            btnKey.includes('left') ||
            btnKey.includes('right')
        ) {
            if (btnKey === 'left') btnKey = 'a';
            if (btnKey === 'right') btnKey = 'arrowright';
            const index = this.keys.indexOf(btnKey);
            if (index !== -1) {
                this.keys.splice(index, 1);
            }
        }
    }
}
