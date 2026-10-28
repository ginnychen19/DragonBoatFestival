/* 遊戲真正會用到的按鍵，其他按鍵（F5、F12、Ctrl+R…）不攔截，交還給瀏覽器 */
const GAME_KEYS = new Set(['a', 'arrowright', ' ', 'q']);

export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = [];
        this.btnLeft = document.querySelector('button.left');
        this.btnRight = document.querySelector('button.right');
        //因為會預先執行，所以把監聽放在這
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        //切到別的視窗時收不到 keyup，回來船會卡在持續移動，所以失焦時全部放開
        window.addEventListener('blur', this.releaseAll.bind(this));
        //螢幕按鈕：按下對應的鍵寫在按鈕的 data-key，觸控與滑鼠共用同一套處理
        for (const btn of [this.btnLeft, this.btnRight]) {
            for (const type of ['touchstart', 'mousedown']) btn.addEventListener(type, this.BtnMousedown.bind(this));
            for (const type of ['touchend', 'touchcancel', 'mouseup']) btn.addEventListener(type, this.BtnMouseup.bind(this));
        }
    }
    releaseAll() {
        this.keys = [];
        this.btnLeft.classList.remove('playhover');
        this.btnRight.classList.remove('playhover');
    }
    pressKey(key) {
        if (!this.keys.includes(key)) this.keys.push(key);
    }
    releaseKey(key) {
        const index = this.keys.indexOf(key);
        if (index !== -1) this.keys.splice(index, 1);
    }
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (!GAME_KEYS.has(key)) return;
        e.preventDefault();

        if (key === 'a') this.btnLeft.classList.add('playhover');
        if (key === 'arrowright') this.btnRight.classList.add('playhover');

        if (key === 'a' || key === 'arrowright') {
            this.pressKey(key);
        } else if (key === ' ') {
            this.game.togglePause();
        } else if (key === 'q') {
            this.game.debugCount++;
            this.game.debug = this.game.debugCount % 2 !== 0;
        }
    }
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (!GAME_KEYS.has(key)) return;
        e.preventDefault();
        if (key === 'a' || key === 'arrowright') this.releaseKey(key);
        if (key === 'a') this.btnLeft.classList.remove('playhover');
        if (key === 'arrowright') this.btnRight.classList.remove('playhover');
    }
    BtnMousedown(e) {
        e.preventDefault(); //touchstart 攔下後不會再補發 mousedown，一次觸控只算一次
        const btn = e.currentTarget;
        btn.classList.add('playhover');
        this.pressKey(btn.dataset.key);
    }
    BtnMouseup(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        btn.classList.remove('playhover');
        this.releaseKey(btn.dataset.key);
    }
}
