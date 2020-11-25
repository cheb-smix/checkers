import React from 'react';

import Button from '../Button';
import Droplist from '../Droplist';
import Slider from '../Slider';
import Settings from '../../Funcs/settings';


export default class Setting extends React.Component{
    render(){
        let settings = new Settings();
        let usersettings = settings.getSettings();
        return (
            <div className="container" id="btnContainer">
                <h5 className="neon">Настройки</h5>
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="animation"
                            items={{"2":"Расширенная","1":"Упрощенная","0":"Без анимации"}}
                            selected={usersettings.animation}
                            placeholder="Анимация"
                            onSelect={settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="difficulty"
                            items={{"3":"Сложно","2":"Среднее","1":"Легко"}}
                            selected={usersettings.difficulty}
                            placeholder="Сложность бота"
                            onSelect={settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Slider
                            id="soundvolume"
                            placeholder="Громкость звуков"
                            value={usersettings.soundvolume}
                            onSet={settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Slider
                            id="musicvolume"
                            placeholder="Громкость музыки"
                            value={usersettings.musicvolume}
                            onSet={settings.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Button
                            action={this.dropSettings} 
                            href="/home" 
                            history={this.props.history} 
                            value="По умолчанию" 
                            theme="grey"
                            strong="true"
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Button
                            action="" 
                            href="/home" 
                            history={this.props.history} 
                            value="Назад" 
                            theme="light"
                            strong="true"
                        />
                    </div>
                </div>
            </div>
        );
    };
}