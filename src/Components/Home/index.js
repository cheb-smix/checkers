import React from 'react';
import Button from '../Button';
import Lang from '../../Funcs/Lang';
import Droplist from '../Droplist';
import Acc from '../../Funcs/Acc';

export default class Home extends React.Component{
    gameChoice = () => {
        window.loft.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="game"
                            items={{"checkers":Lang("checkersGameName"),"giveaway":Lang("giveawayGameName"),"corners":Lang("cornersGameName"),"checkmates":Lang("chessGameName")}}
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
        return window.loft.settings.getSettings("game") ?? "checkers";
    }

    getGameRoute = () => {
        return "/" + this.getGame();
    }

    render(){
        let acc = new Acc(this.props.setAppState);
        return (
            <div id="btnContainer" className="animate__fadeIn animate__animated">
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