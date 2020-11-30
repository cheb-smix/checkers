import React from 'react';

import Button from '../Button';
import Droplist from '../Droplist';
import Slider from '../Slider';
import Settings from '../../Funcs/settings';
import Lang from '../../Lang';


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