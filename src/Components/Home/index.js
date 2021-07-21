import React from 'react';
import Button from '../Button';
import LangBtn from '../LangBtn';
import Lang from '../Localization';
import Droplist from '../Droplist';
import Acc from '../../Funcs/Acc';
import './home.css';


import RoundProgressBar from '../RoundProgressBar';

export default class Home extends React.Component{
    gameChoice = () => {
        if (window.gvar.length < 2) return;

        let items = {};
        for (let g in window.gvar) {
            items[window.gvar[g]] = Lang(`${window.gvar[g]}GameName`);
        }

        window.loft.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="game"
                            items={items}
                            selected={window.loft.usersettings.game}
                            placeholder={Lang("gameText") + "                   "} 
                            onSelect={(k, v)=>{
                                window.loft.showModal(false);
                                window.loft.settings.saveSetting("game", v);
                                window.loft.settings.saveSetting("isCheckers", (v === "checkers" || v === "corners"));
                            }}
                        />
                    </div>
                </div>
            </div>,
            Lang("chooseGameText")
        );
    }

    getGame = () => {
        return window.loft.settings.getGame();
    }

    getGameRoute = () => {
        return "/" + this.getGame();
    }

    render(){
        let acc = new Acc(this.props.setAppState);
        return (
            <div id="btnContainer" className="animate__fadeIn animate__animated">
                <LangBtn />
                <h5 onClick={this.gameChoice}>{Lang(this.getGame() + "GameName")}</h5>
                <Button 
                    action={()=>window.loft.settings.saveSetting("mode", "bot")} 
                    href={this.getGameRoute()} 
                    value={Lang("playWithBot")} 
                />
                {
                    (window.loft.config.onlineAvailable || window.loft.config.Debug) ? 
                <Button 
                    action={()=>window.loft.settings.saveSetting("mode", "online")} 
                    href={this.getGameRoute()} 
                    value={Lang("playOnlineGame")} 
                /> : ""
                }
                {
                    this.props.isGuest 
                    ? 
                    <Button action={acc.signIn} href="" value={Lang("signInText")} /> 
                    : 
                    <React.Fragment>
                        <Button action={acc.showAccStat} href="" value={window.loft.user_info.display_name} /> 
                        <Button action={acc.signOut} href="" value={Lang("signOutText")} /> 
                    </React.Fragment>
                } 
                <Button action="" href="/settings" value={Lang("settingsText")} />

            <RoundProgressBar />
            </div>
        );
    };
}

/*
<Button 
                    action={()=>window.loft.settings.saveSetting("mode", "local")} 
                    href={this.getGameRoute()} 
                    value={Lang("playByBlueTooth")} 
                />
                */