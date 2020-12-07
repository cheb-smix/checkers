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
            soundvolume: 70,
            musicvolume: 70,
            mode: "bot",
            atoken: "",
            loaded: false,
            game: "checkers",
        };
        this.defaultusersettings = {
            animation: 1,
            difficulty: 1,
            soundvolume: 70,
            musicvolume: 70,
            mode: "bot",
            atoken: "",
            loaded: false,
            game: "checkers",
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
}

export default class Setting extends React.Component{
    render(){
        let settings = new Settings();
        let usersettings = settings.getSettings();
        return (
            <div className="container" id="btnContainer">
                <h5 className="neon">{Lang("settingsText")}</h5>
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="animation"
                            items={{"2":Lang("animationLevel2"),"1":Lang("animationLevel1"),"0":Lang("animationLevel0")}}
                            selected={usersettings.animation}
                            placeholder={Lang("animationSetting")}
                            onSelect={settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="difficulty"
                            items={{"3":Lang("difficultyLevel3"),"2":Lang("difficultyLevel2"),"1":Lang("difficultyLevel1")}}
                            selected={usersettings.difficulty}
                            placeholder={Lang("difficultySetting")}
                            onSelect={settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Slider
                            id="soundvolume"
                            placeholder={Lang("soundSetting")}
                            value={usersettings.soundvolume}
                            onSet={settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Slider
                            id="musicvolume"
                            placeholder={Lang("musicSetting")}
                            value={usersettings.musicvolume}
                            onSet={settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Button
                            action={this.dropSettings} 
                            href="/home" 
                            history={this.props.history} 
                            value={Lang("returnDefaults")} 
                            theme="neon"
                            strong="true"
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Button
                            action="" 
                            href="/home" 
                            history={this.props.history} 
                            value={Lang("goBackText")}  
                            theme="grey"
                            strong="true"
                        />
                    </div>
                </div>
            </div>
        );
    };
}