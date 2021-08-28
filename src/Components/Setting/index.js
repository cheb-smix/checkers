import React from 'react';

import Button from '../Button';
import Droplist from '../Droplist';
import Slider from '../Slider';
import Lang from '../Localization';

export default class Setting extends React.Component{
    state = {
        modal: (!React.isset(this.props.modal) || this.props.modal !== false)
    }
    
    render() {
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
                        <Droplist
                            id="language"
                            items={window.loft.localization.langTitles}
                            selected={window.loft.usersettings.language}
                            placeholder="Language"
                            onSelect={(name, value) => {
                                window.loft.localization.set(value, false);
                                window.loft.settings.saveSetting(name, value);
                            }}
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
                <div className="row" style={{position: "absolute", bottom: 0, width: "100%", color: "grey", fontSize: "12px"}}>
                    <div className="col-12">
                        <span>App v.{window.app.version} of {window.app.lastUpdate.split("GMT").shift()}</span>
                    </div>
                </div>
            </div>
        );
    };
}