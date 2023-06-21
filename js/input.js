
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
        this.btnPlay.on('touchstart mousedown', this.BtnMousedown.bind(this));
        this.btnPlay.on('touchend mouseup', this.BtnMouseup.bind(this));
    }
    handleKeyDown(e) {
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
                this.btnStop.css('background-image', "url('https://gotoo.co/demo/elizabeth/04_DragonBoatFestival/assest/img/btn-R.svg')")
            } else {
                this.game.gamePause = false;
                this.btnStop.css('background-image', "url('https://gotoo.co/demo/elizabeth/04_DragonBoatFestival/assest/img/btn-Stop.svg')")
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
