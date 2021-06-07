export default class Settings{
    
    constructor() {
        this.usersettings = {
            animation: 1,
            difficulty: 1,
            fanfaravolume: 50,
            soundvolume: 70,
            musicvolume: 0,
            mode: "bot",
            atoken: "",
            loaded: false,
            game: "checkers",
            language: 'auto',
        };
        this.defaultusersettings = {
            animation: 1,
            difficulty: 1,
            fanfaravolume: 50,
            soundvolume: 70,
            musicvolume: 0,
            mode: "bot",
            atoken: "",
            loaded: false,
            game: "checkers",
            language: 'auto',
        };
    }

    getGame = () => {
        let g = this.getSettings("game");
        if (!g || window.gvar.indexOf(g) < 0) g = window.gvar[0];
        return g;
    }

    dropSettings = () => {
        for(let i in this.defaultusersettings){
            this.saveSetting(i, this.defaultusersettings[i]);
        }
        document.querySelector("#musicplayer").volume = this.defaultusersettings.musicvolume / 100;
        return this.defaultusersettings;
    }

    loadSettings = () => {
        for(let key in this.usersettings){
            let v = localStorage.getItem(key);
            if(typeof(v)==="string"){
                v = v==="true"?true:v;
                v = v==="false"?false:v;
                this.usersettings[key]=v;
            }
        }
    }
    
    saveSetting = (key,value="") => {
        this.usersettings[key] = value;
        window.loft.usersettings[key] = value;
        if(value==="") localStorage.removeItem(key);
        else localStorage.setItem(key,value);

        if (key === "musicvolume") {
            let musicplayer = document.querySelector("#musicplayer");
            musicplayer.volume = value / 100;
            if (value > 0 && musicplayer.paused) {
                if (!musicplayer.src) window.loft.nextTrack();
                musicplayer.play();
            }
            if (value === 0 && !musicplayer.paused) musicplayer.pause();
        }

        if (key === "game") {
            window.loft.isCheckers = ["checkers", "giveaway"].indexOf(value) >= 0;
        }
    }

    getSettings = (key = false) => {
        if (!this.usersettings.loaded) this.loadSettings();
        if (key) return this.usersettings[key];
        return this.usersettings;
    }
}