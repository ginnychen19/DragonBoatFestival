/* 音效管理：一首背景音樂循環播放，事件音效可以重疊。
   開關狀態存在 localStorage，重新開始（整頁重載）後沿用玩家上次的選擇。 */
const STORAGE_KEY = 'dragonboat.soundOn';

export class Sound {
    constructor() {
        this.bgm = document.getElementById('music_chinese01');
        this.bgm.volume = 0.5;
        this.sfx = {
            collect: document.getElementById('music_collect'),
            fail: document.getElementById('music_fail'),
            win: document.getElementById('music_win'),
        };
        this.listeners = [];

        let saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* 隱私模式拿不到就用預設 */ }
        this.enabled = saved === null ? true : saved === 'true';
    }
    /* 註冊狀態變化的回呼，註冊時先用目前狀態呼叫一次，UI 不用另外初始化 */
    onChange(fn) {
        this.listeners.push(fn);
        fn(this.enabled);
    }
    setEnabled(on) {
        this.enabled = on;
        try { localStorage.setItem(STORAGE_KEY, String(on)); } catch (e) { /* 存不了就只在本次有效 */ }
        if (on) this.playBgm();
        else this.bgm.pause();
        this.listeners.forEach(fn => fn(on));
    }
    toggle() {
        this.setEnabled(!this.enabled);
    }
    playBgm() {
        if (!this.enabled) return;
        const p = this.bgm.play();
        //瀏覽器要求先有使用者互動才能出聲，被拒絕就等下一次點擊再播
        if (p && p.catch) p.catch(() => { });
    }
    play(name) {
        if (!this.enabled) return;
        const src = this.sfx[name];
        if (!src) {
            console.warn(`未知的音效：${name}`);
            return;
        }
        //每次複製一份播放，連續快速撿兩面旗子兩聲都聽得到；播完的副本沒有被引用會自動回收
        const clip = src.cloneNode();
        const p = clip.play();
        if (p && p.catch) p.catch(() => { });
    }
}
