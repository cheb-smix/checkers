import React from 'react';
import Button from '../Button';
import Lang from '../../Funcs/lang';
import Droplist from '../Droplist';
import { Settings } from '../Setting';

export default class Home extends React.Component{

    state = {
        settings: new Settings()
    }

    gameChoice = () => {
        this.props.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="game"
                            items={{"checkers":Lang("checkersGameName"),"giveaway":Lang("giveawayGameName"),"corners":Lang("cornersGameName"),"checkmates":Lang("chessGameName")}}
                            selected={this.props.gamename}
                            placeholder={Lang("gameText") + "                   "} 
                            onSelect={(k, v)=>{
                                this.props.showModal(false);
                                this.state.settings.saveSetting("game", v);
                            }}
                        />
                        <i className="fa fa-play fa-2x"></i>
                    </div>
                </div>
            </div>,
            Lang("chooseGameText")
        );
    }

    getGame = () => {
        return this.state.settings.getSettings("game") ?? "checkers";
    }

    getGameRoute = () => {
        return "/" + this.getGame();
    }

    render(){
        return (
            <div id="btnContainer" className="animate__fadeIn animate__animated">
                <h5 onClick={this.gameChoice}>{Lang(this.getGame() + "GameName")}</h5>
                <Button 
                    action={()=>this.state.settings.saveSetting("mode", "bot")} 
                    href={this.getGameRoute()} 
                    history={this.props.history} 
                    value={Lang("playWithBot")} 
                />
                <Button 
                    action={()=>this.state.settings.saveSetting("mode", "local")} 
                    href={this.getGameRoute()} 
                    history={this.props.history} 
                    value={Lang("playByBlueTooth")} 
                />
                <Button 
                    action={()=>this.state.settings.saveSetting("mode", "online")} 
                    href={this.getGameRoute()} 
                    history={this.props.history} 
                    value={Lang("playOnlineGame")} 
                />
                <Button action="" href="" history={this.props.history} value={Lang("signInText")} />
                <Button action="" href="/settings" history={this.props.history} value={Lang("settingsText")} />
            </div>
        );
    };
}