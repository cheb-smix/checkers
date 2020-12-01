/*export default class Settings{
    
    constructor() {
        this.usersettings = {
            animation: 1,
            difficulty: 1,
            soundvolume: 70,
            musicvolume: 70,
            mode: "bot",
            atoken: "",
            loaded: false,
        };
        this.defaultusersettings = {
            animation: 1,
            difficulty: 1,
            soundvolume: 70,
            musicvolume: 70,
            mode: "bot",
            atoken: "",
            loaded: false,
        };
    }

    dropSettings = () => {
        for(let i in this.defaultusersettings){
            this.saveSetting(i, this.defaultusersettings[i]);
        }
        document.querySelector("#musicplayer").volume = this.defaultusersettings.musicvolume / 100;
        document.querySelector("#soundplayer").volume = this.defaultusersettings.soundvolume / 100;
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
        if(value==="") localStorage.removeItem(key);
        else localStorage.setItem(key,value);

        if (key === "musicvolume") {
            let musicplayer = document.querySelector("#musicplayer");
            musicplayer.volume = value / 100;
            if (value > 0 && musicplayer.paused) musicplayer.play();
            if (value === 0 && !musicplayer.paused) musicplayer.pause();
            
        }
        if (key === "soundvolume") document.querySelector("#soundplayer").volume = value / 100;
    }

    getSettings = (key = false) => {
        if (!this.usersettings.loaded) this.loadSettings();
        if (key) return this.usersettings[key];
        return this.usersettings;
    }
}*/