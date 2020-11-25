import React from 'react';

import Button from '../Button';
import Settings from '../../Funcs/settings';



export default class Home extends React.Component{

    state = {
        settings: new Settings()
    }

    render(){
        return (
            <div id="btnContainer" className="animate__fadeIn animate__animated">
                <h5 className="">Checkers</h5>
                <Button 
                    action={()=>this.state.settings.saveSetting("mode", "bot")} 
                    href="/checkers" 
                    history={this.props.history} 
                    value="Против бота" 
                />
                <Button 
                    action={()=>this.state.settings.saveSetting("mode", "local")} 
                    href="/checkers" 
                    history={this.props.history} 
                    value="Локальная игра" 
                />
                <Button 
                    action={()=>this.state.settings.saveSetting("mode", "online")} 
                    href="/checkers" 
                    history={this.props.history} 
                    value="Онлайн" 
                />
                <Button action="" href="/checkers" history={this.props.history} value="Войти" />
                <Button action="" href="/settings" history={this.props.history} value="Настройки" />
            </div>
        );
    };
}