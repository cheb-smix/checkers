import React from 'react';
import "./appheader.css";
import Droplist from "../Droplist";
import sha1 from "../../Funcs/sha1";
import Button from '../Button';
import Lang from '../../Funcs/Lang';
import postData from '../../Funcs/PostDataFuncs';
import Cookie from '../../Funcs/Cookie';
import Routing from '../../Funcs/Routing';
import Noise from '../../Funcs/Noise';
import Setting from '../Setting';

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
                        <i className="fa fa-play fa-2x"></i>
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

    dropSettings = () => {
        window.loft.settings.dropSettings();
        //for (let k in us) this.props.updateSetting(k, us[k]);
        window.loft.showModal(false);
    }

    saveSetting = (key, val) => {
        window.loft.settings.saveSetting(key, val);
        //this.props.updateSetting(key, val);
    }


    settingsClick = () => {
        window.loft.showModal(<Setting modal="true" />, Lang("settingsText"));
    }
    showAccStat = () => {
        let s = this.props.playerStat;
        let startexp = 0;
        if(s.lvl > 1) startexp = 50*(Math.pow(2,s.lvl-1));
        let endexp = 50*(Math.pow(2,s.lvl));
        let progress = Math.percent(s.exp - startexp,endexp - startexp);
        let left = 50 - parseInt(progress,10)/2;

        window.loft.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-12" id="message"></div>
                    <div className="col-12">
                        <h4 style={{margin: "0", border: "0"}}>{s.lvl} {Lang("levelText")}</h4>
                        <div className="exp">
                            <div className="progress" style={{width: progress, left: left+"%"}}>{s.exp}</div>
                            <table className="stable" style={{padding: "0px"}}><tbody><tr><td>{startexp}</td><td>{endexp}</td></tr></tbody></table>
                        </div>
                        <table className="stable">
                            <tbody>
                                <tr><td>{Lang("expNeededForNextLvl")}</td><td>{endexp - s.exp}</td></tr>
                                <tr><td>{Lang("totalGames")}</td><td>{s.games}</td></tr>
                                <tr><td>{Lang("totalWons")}</td><td>{s.won} ({Math.percent(s.won,s.games,2)})</td></tr>
                                <tr><td>{Lang("totalLosts")}</td><td>{s.lost} ({Math.percent(s.lost,s.games,2)})</td></tr>
                                <tr><td>{Lang("totalDraws")}</td><td>{s.games-s.won-s.lost} ({Math.percent(s.games-s.won-s.lost,s.games,2)})</td></tr>
                                <tr><td>{Lang("totalWons")}/{Lang("totalLosts")}</td><td>{Math.coefficient(s.won,s.lost,2)}</td></tr>
                                <tr><td>{Lang("totalMoves")}</td><td>{s.moves}</td></tr>
                                <tr><td>{Lang("totalHops")}</td><td>{s.steps}</td></tr>
                                <tr><td>{Lang("avgGameTime")}</td><td>{Math.round(s.playeravgtime)} {Lang("secondsText")} / {Math.round(s.totalavgtime)} {Lang("secondsText")}</td></tr>
                                <tr><td>{Lang("avgGameMoves")}</td><td>{Math.round(s.playeravgmoves)} / {Math.round(s.totalavgmoves)}</td></tr>
                                <tr><td>{Lang("avgGameHops")}</td><td>{Math.round(s.playeravgsteps)} / {Math.round(s.totalavgsteps)}</td></tr>
                                <tr><td>{Lang("avgMoveHops")}</td><td>{Math.coefficient(s.playeravgsteps,s.playeravgmoves,2)} / {Math.coefficient(s.totalavgsteps,s.totalavgmoves,2)}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>,
            this.props.playerName
        );
    }
    newRegistration = () => {
        window.loft.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-12" id="message"></div>
                    <div className="col-12">
                        <input type="text" id="name" placeholder={Lang("displayName")} minLength="3" maxLength="40" />
                    </div>
                    <div className="col-12">
                        <input type="text" id="login" placeholder={Lang("loginText")} minLength="4" maxLength="30" />
                    </div>
                    <div className="col-12">
                        <input type="text" id="email" placeholder={Lang("emailText")} minLength="4" maxLength="70" />
                    </div>
                    <div className="col-12">
                        <input type="password" id="pass" placeholder={Lang("passwordText")} minLength="6" maxLength="60" />
                    </div>
                    <div className="col-md-6 col-12">
                        <Button
                            action={this.gogoRegister} 
                            href="" 
                            value={Lang("signUpText")} 
                            theme="neon"
                            strong="true"
                        />
                    </div>
                </div>
            </div>,
            Lang("signUpText")
        );
    }
    gogoRegister = () => {
        let m = document.getElementById("message");
        m.className = "";
        if(document.getElementById("pass").value !== document.getElementById("pass2").value){
            m.className = "error";
            m.innerHTML = Lang("passwordsNotMatch");
            return false;
        }
        let a = document.querySelectorAll("#modal .row input");
        for(let f=0;f<a.length;f++){
            if(a[f].value.length < a[f].minLength || a[f].value.length > a[f].maxLength){
                m.className = "error";
                m.innerHTML = Lang("fieldRuleText1").replace("$", a[f].placeholder) + Lang("fieldRuleText2").replace("$", a[f].minLength+"-"+a[f].maxLength);
                return false;
            }
        }
        postData({
            url: window.loft.apiserver + "sign-up",
            data: {
                display_name:   document.getElementById("name").value,
                username:       document.getElementById("login").value,
                password:       sha1(document.getElementById("pass").value),
                email:          document.getElementById("email").value,
            },
            device: window.loft.device,
            success: (d)=>{
                if (d.success) {
                    m.className = "success";
                    m.innerHTML = Lang("success");
                } else {
                    m.className = "error";
                    m.innerHTML = d.errors ? d.errors[Object.keys(d.errors).shift()] : Lang("failed");
                }
                
                
                /*this.saveSetting("atoken",d.data.token);
                if(d.success) window.location.reload();*/
            }
        });
    }
    signIn = () => {
        window.loft.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-12" id="message"></div>
                    <div className="col-12">
                        <input type="text" id="login" placeholder={Lang("loginText")} maxLength="30" />
                    </div>
                    <div className="col-12">
                        <input type="password" id="pass" placeholder={Lang("passwordText")} />
                    </div>
                    <div className="col-md-6 col-12">
                        <Button
                            action={this.gogoSign} 
                            href="" 
                            value={Lang("signInText")} 
                            theme="neon"
                            strong="true"
                        />
                    </div>
                </div>
            </div>,
            Lang("authText")
        );
    }
    gogoSign = () => {
        postData({
            url: window.loft.apiserver + "sign-in",
            data: {
                username:  document.querySelector("#login").value,
                password:   document.querySelector("#pass").value
            },
            device: window.loft.device,
            success: (d)=>{
                let m = document.querySelector("#message");
                if(d.success){
                    m.className = "success";
                    m.innerHTML = Lang("success");
                    Cookie.set("_identity-frontend", d.atoken);
                    /*this.saveSetting("atoken",d.data.token);
                    window.location.reload();*/
                }else{
                    m.className = "error";
                    m.innerHTML = d.errors[Object.keys(d.errors).shift()]
                }
            }
        });
    }
    signOut = () => {
        this.saveSetting("atoken","");
        window.location.reload();
    }

    goHome = () => Routing("/home");

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

        if(this.props.playerSigned){
            accDiv = <React.Fragment>
                        <div className="uhicon" onClick={this.showAccStat}><i className="fa fa-id-badge"></i><span> {this.props.playerName}</span></div>
                        {accDiv}
                        <div className="uhicon" onClick={this.signOut}><i className="fa fa-times"></i><span> {Lang("signOutText")}</span></div>
                    </React.Fragment>;
        }else{
            accDiv = <React.Fragment>
                        <div className="uhicon" onClick={this.signIn} onMouseDown={() => Noise("menu-click")}><i className="fa fa-sign-in-alt"></i><span> {Lang("signInText")}</span></div>
                        <div className="uhicon" onClick={this.newRegistration} onMouseDown={() => Noise("menu-click")}><i className="fa fa-key"></i><span> {Lang("signUpText")}</span></div>
                        {accDiv}
                    </React.Fragment>;
        }

        accDiv = <div id="uhiconcontainer" className={uhcclass}>
                    <div id="uhiconcontainershadow" onClick={() => this.navigatorClick(false)}></div>
                    <div className="uhicon" onClick={this.goHome} onMouseDown={() => Noise("menu-click")}><i className="fa fa-home"></i><span> {Lang("homePageText")}</span></div>
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