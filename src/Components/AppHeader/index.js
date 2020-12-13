import React from 'react';
import "./appheader.css";
import Droplist from "../Droplist";
import Button from '../Button';
import Lang from '../../Funcs/Lang';
import Routing from '../../Funcs/Routing';
import Noise from '../../Funcs/Noise';
import Setting from '../Setting';
import Acc from '../../Funcs/Acc';

export default class AppHeader extends React.Component{

    state = {
        naviActive: null
    }

    gameChoice = () => {
        let doptext = "";
        if(this.props.playerStatus === "in_game" && this.props.online) doptext = <h5 className="warning">{Lang("gameCloseWarning")}</h5>;
        if(this.props.searching) doptext = <h5>{Lang("gameCloseWarning")}</h5>;

        if (doptext) doptext = <div className="col-md-6 col-12">{doptext}</div>

        window.loft.showModal(
            <div className="container">
                <div className="row">
                    {doptext}
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="game"
                            items={{"checkers":Lang("checkersGameName"),"giveaway":Lang("giveawayGameName"),"corners":Lang("cornersGameName"),"checkmates":Lang("chessGameName")}}
                            selected={this.props.gamename}
                            placeholder={Lang("gameText") + "                   "} 
                            onSelect={(k, v)=>{
                                window.loft.showModal(false);
                                Routing("/" + v);
                            }}
                        />
                    </div>
                </div>
            </div>,
            Lang("chooseGameText")
        );
    }

    stopSearchingOpponent = () => {
        this.props.stopTheSearch();
        window.loft.showModal(false);
    }

    gameButClick = () => {
        if(this.props.playerStatus === "in_game" && this.props.online){
            window.loft.showModal(
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                        <h5>{Lang("sureYouWannaQuit")}</h5><h5 className="warning">{Lang("youllLooseIfYouQuit")}</h5>
                        </div>
                        <div className="col-md-6 col-12">
                            <Button
                                action={() => window.loft.showModal(false)} 
                                href="" 
                                value={Lang("cancelText")} 
                                theme="neon"
                                strong="true"
                            />
                        </div>
                        <div className="col-md-6 col-12">
                            <Button
                                action={this.props.quit} 
                                href="" 
                                value={Lang("quitTheGame")}
                                theme="neon"
                                strong="light"
                            />
                        </div>
                    </div>
                </div>,
                Lang("attention")
            )
        }
        if(this.props.searching){
            let approxtext = <h5>{Lang("cancelSearchText").replace("$", this.props.serverInfo.avgwaittime.avg - this.props.count)}</h5>;
            if(this.props.serverInfo.avgwaittime.cnt===0 || this.props.serverInfo.playersstat.total<5) approxtext = <h5>{Lang("cancelSearchConfirm")}?</h5>;
            window.loft.showModal(
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {approxtext}
                        </div>
                        <div className="col-md-6 col-12">
                            <Button
                                action={() => window.loft.showModal(false)} 
                                href="" 
                                value={Lang("cancelText")} 
                                theme="neon"
                                strong="true"
                            />
                        </div>
                        <div className="col-md-6 col-12">
                            <Button
                                action={this.stopSearchingOpponent} 
                                href="" 
                                value={Lang("cancelSearchConfirm")} 
                                theme="light"
                                strong="true"
                            />
                        </div>
                    </div>
                </div>,
                Lang("attention")
            )
        }else{
            this.props.startNewSearch();
        }
    }

    settingsClick = () => {
        window.loft.showModal(<Setting modal="true" />, Lang("settingsText"));
    }

    navigatorClick = (h = null) => {
        if (h === null) this.setState({naviActive: !this.state.naviActive});
        else this.setState({naviActive: h});
    }

    animationend = (event) => {
        event.target.className = "uhicon";
        event.target.style.animationDelay = "0ms";
    }

    componentDidMount = () => {
        let title = document.getElementById('utitle');
        document.getElementById("uhiconcontainer").style.top = `${title.offsetHeight}px`;
        title.className = "animate__backInLeft animate__animated fa-2x";
        title.addEventListener("animationend",(event) => {
            event.target.className = "fa-2x";
        });
    }

    render(){
        let acc = new Acc(this.props.setAppState);

        let gameclass = "fa fa-gamepad";
        if(this.props.status === "in_game" && this.props.online) gameclass = "fa fa-stop-circle";
        if(this.props.searching) gameclass = "fa fa-ellipsis-h fa-smx-spin";

        let gametitle = Lang("searchingTheEnemy");
        if(this.props.status === "in_game" && this.props.online) gametitle = Lang("quitTheGame");
        if(this.props.searching) gametitle = Lang("cancelSearchConfirm");

        let uhcclass = "fa-2x";
        uhcclass = this.state.naviActive ? "animate__fadeInLeft animate__animated fa-2x" : "animate__fadeOutLeft animate__animated fa-2x";
        if (this.state.naviActive === null) uhcclass = "hidden fa-2x";

        let accDiv = <React.Fragment>
            <div className="uhicon" onClick={this.gameButClick} onMouseDown={() => Noise("menu-click")} title={gametitle}><i className={gameclass}></i><span> {gametitle}</span>{this.props.searching?<i style={{width: "35px"}}> {this.props.count}</i>:""}</div>
            <div className="uhicon" onClick={this.settingsClick} onMouseDown={() => Noise("menu-click")}><i className="fa fa-sliders-h"></i><span> {Lang("settingsText")}</span></div>
        </React.Fragment>;

        if(!this.props.isGuest){
            accDiv = <React.Fragment>
                        <div className="uhicon" onClick={acc.showAccStat}><i className="fa fa-id-badge"></i><span> {this.props.playerName}</span></div>
                        {accDiv}
                        <div className="uhicon" onClick={acc.signOut}><i className="fa fa-times"></i><span> {Lang("signOutText")}</span></div>
                    </React.Fragment>;
        }else{
            accDiv = <React.Fragment>
                        <div className="uhicon" onClick={acc.signIn} onMouseDown={() => Noise("menu-click")}><i className="fa fa-sign-in-alt"></i><span> {Lang("signInText")}</span></div>
                        <div className="uhicon" onClick={acc.signUp} onMouseDown={() => Noise("menu-click")}><i className="fa fa-key"></i><span> {Lang("signUpText")}</span></div>
                        {accDiv}
                    </React.Fragment>;
        }

        accDiv = <div id="uhiconcontainer" className={uhcclass}>
                    <div id="uhiconcontainershadow" onClick={() => this.navigatorClick(false)}></div>
                    <div className="uhicon" onClick={() => Routing("/home")} onMouseDown={() => Noise("menu-click")}><i className="fa fa-home"></i><span> {Lang("homePageText")}</span></div>
                    {accDiv}
                </div>;

        return (
            <div className="uheader">
                <div id="utitle" className="fa-2x" style={{whiteSpace: "nowrap"}} onClick={this.gameChoice} onMouseDown={() => Noise("menu-click")}><i className="fa fa-chess" style={{color: (this.props.online || this.props.searching!==false)?this.props.playerColor:"white"}}> </i> {this.props.gamename}</div>
                {accDiv}
                <div id="navibut" className="uhicon" onClick={() => this.navigatorClick(null)} onMouseDown={() => Noise("menu-click")}><i className="fa fa-bars fa-2x"></i></div>
            </div>
        );
    };
}