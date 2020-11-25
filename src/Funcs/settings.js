export default class Settings{
    
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
    }

    getSettings = (key = false) => {
        if (!this.usersettings.loaded) this.loadSettings();
        if (key) return this.usersettings[key];
        return this.usersettings;
    }
}