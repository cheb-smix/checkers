import React from 'react';

import Button from '../Button';
import Droplist from '../Droplist';
import Slider from '../Slider';
import Lang from '../../Funcs/Lang';

export class Settings{
    
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

export default class Setting extends React.Component{
    state = {
        modal: (typeof(this.props.modal) === "undefined" || this.props.modal !== false)
    }
    render(){
        return (
            <div className="container" id={this.state.modal === false ? 'btnContainer' : 'modalSettingsContainer'} >
                {this.state.modal === false ? <h5 className="neon">{Lang("settingsText")}</h5> : ""}
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="animation"
                            items={{"2":Lang("animationLevel2"),"1":Lang("animationLevel1"),"0":Lang("animationLevel0")}}
                            selected={window.loft.usersettings.animation}
                            placeholder={Lang("animationSetting")}
                            onSelect={window.loft.settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="difficulty"
                            items={{"3":Lang("difficultyLevel3"),"2":Lang("difficultyLevel2"),"1":Lang("difficultyLevel1")}}
                            selected={window.loft.usersettings.difficulty}
                            placeholder={Lang("difficultySetting")}
                            onSelect={window.loft.settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Slider
                            id="soundvolume"
                            placeholder={Lang("soundSetting")}
                            value={window.loft.usersettings.soundvolume}
                            onSet={window.loft.settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Slider
                            id="fanfaravolume"
                            placeholder={Lang("fanfarasSetting")}
                            value={window.loft.usersettings.fanfaravolume}
                            onSet={window.loft.settings.saveSetting}
                        />
                    </div>
                    { window.loft.musicEnabled ? 
                    <div className="col-md-6 col-12">
                        <Slider
                            id="musicvolume"
                            placeholder={Lang("musicSetting")}
                            value={window.loft.usersettings.musicvolume}
                            onSet={window.loft.settings.saveSetting}
                        />
                    </div>
                    : "" }
                    <div className="col-md-6 col-12">
                        <Button
                            action={window.loft.settings.dropSettings} 
                            href="/home" 
                            value={Lang("returnDefaults")} 
                            theme="neon"
                            strong="true"
                        />
                    </div>
                    {this.state.modal === false ? <div className="col-md-6 col-12">
                        <Button
                            action="" 
                            href="/home" 
                            value={Lang("goBackText")}  
                            theme="grey"
                            strong="true"
                        />
                    </div> : ""}
                </div>
            </div>
        );
    };
}