import React from 'react';
import Button from '../Button';
import LangBtn from '../LangBtn';
import Lang from '../Localization';
import Droplist from '../Droplist';
import './home.css';

export default class Home extends React.Component
{
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

    render()
    {
        return (
            <div id="btnContainer" className="animate__fadeIn animate__animated">
                <LangBtn />
                <Button 
                    action="" 
                    theme="grey" 
                    href="/player" 
                    value="" 
                    round={true} 
                    icon="fa fa-user" 
                    styles={{position: "absolute", left: "0vh", top: "0vh"}} 
                />

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
                <Button action="" href="/settings" value={Lang("settingsText")} />
                <Button action="" href="/about" value={Lang("aboutText")} />

                {
                    window.loft.apiserver.indexOf('//192.168.') > 0 ? <h5 style={{color: 'red', fontSize: '10vmin'}}>Working with TEST SERVER!</h5> : ''
                }
                
            </div>
        );
    };
}