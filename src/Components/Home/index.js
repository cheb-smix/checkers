import React from 'react';

import Button from '../Button';
import Settings from '../../Funcs/settings';
import Lang from '../../Lang';



export default class Home extends React.Component{

    state = {
        settings: new Settings()
    }

    render(){
        return (
            <div id="btnContainer" className="animate__fadeIn animate__animated">
                <h5 className="">{Lang("checkersGameName")}</h5>
                <Button 
                    action={()=>this.state.settings.saveSetting("mode", "bot")} 
                    href="/checkers" 
                    history={this.props.history} 
                    value={Lang("playWithBot")} 
                />
                <Button 
                    action={()=>this.state.settings.saveSetting("mode", "local")} 
                    href="/checkers" 
                    history={this.props.history} 
                    value={Lang("playByBlueTooth")} 
                />
                <Button 
                    action={()=>this.state.settings.saveSetting("mode", "online")} 
                    href="/checkers" 
                    history={this.props.history} 
                    value={Lang("playOnlineGame")} 
                />
                <Button action="" href="/checkers" history={this.props.history} value={Lang("signInText")} />
                <Button action="" href="/settings" history={this.props.history} value={Lang("settingsText")} />
            </div>
        );
    };
}