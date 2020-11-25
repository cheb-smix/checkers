import React from 'react';
import "./appheader.css";
import Droplist from "../Droplist";
import Slider from "../Slider";
import sha1 from "../../Funcs/sha1";
import Settings from '../../Funcs/settings';

export default class AppHeader extends React.Component{

    state = {
        naviActive: null,
        settings: new Settings()
    }

    

    gameChoice = () => {
        let doptext = "";
        if(this.props.playerStatus === "in_game" && this.props.online) doptext = <h5 className="warning">За выход из игры Вам будет засчитано поражение</h5>;
        if(this.props.searching) doptext = <h5>За выход из игры Вам будет засчитано поражение</h5>;

        if (doptext) doptext = <div className="col-md-6 col-12">{doptext}</div>

        this.props.showModal(
            <div className="container">
                <div className="row">
                    {doptext}
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="game"
                            items={{"checkers":"Шашки","giveaway":"Поддавки","corners":"Уголки","checkmates":"Шахматы"}}
                            selected={this.props.gamename}
                            placeholder="Игра &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp;  &nbsp; "
                            onSelect={(k, v)=>{
                                this.props.hideModal();
                                document.querySelector("#utitle").className = "animate__backOutLeft animate__animated fa-2x";
                                document.querySelector(".umaincon").className = "umaincon animate__fadeOutLeft animate__animated";
                                setTimeout(() => {
                                    this.props.history.push("/" + v);
                                    //document.querySelector(".umaincon").className = "umaincon animate__fadeInRight animate__animated";
                                    //window.location.href = "/" + v;
                                }, 1000);
                            }}
                        />
                        <i className="fa fa-play fa-2x"></i>
                    </div>
                </div>
            </div>,
            "Выберите игру"
        );
    }

    stopSearchingOpponent = () => {
        this.props.stopTheSearch();
        this.props.hideModal();
    }

    gameButClick = () => {
        if(this.props.playerStatus === "in_game" && this.props.online){
            this.props.showModal(
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <h5>Вы уверены в том, что хотите покинуть игру?</h5><h5 className="warning">Вам будет засчитано поражение!</h5>
                        </div>
                        <div className="col-md-6 col-12">
                                <div className="sbtn grey-sbtn" onClick={this.props.hideModal}>Отмена</div>
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="sbtn light-sbtn" onClick={this.props.quit}>Выйти из игры</div>
                        </div>
                    </div>
                </div>,
                "Внимание!"
            )
        }
        if(this.props.searching){
            let approxtext = <h5>Прекратить поиск? В ближайшие {this.props.serverInfo.avgwaittime.avg - this.props.count} сек. противник вероятнее всего найдется! (но это не точно)</h5>;
            if(this.props.serverInfo.avgwaittime.cnt===0 || this.props.serverInfo.playersstat.total<5) approxtext = <h5>Прекратить поиск?</h5>;
            this.props.showModal(
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {approxtext}
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="sbtn grey-sbtn" onClick={this.props.hideModal}>Отмена</div>
                        </div>
                        <div className="col-md-6 col-12">
                            <div className="sbtn light-sbtn" onClick={this.stopSearchingOpponent}>Прекратить поиск</div>
                        </div>
                    </div>
                </div>,
                "Внимание!"
            )
        }else{
            this.props.startNewSearch();
        }
    }

    dropSettings = () => {
        this.state.settings.dropSettings();
        this.props.hideModal();
    }

    saveSetting = (key, val) => {
        this.state.settings.saveSetting(key, val);
        this.props.updateSetting(key, val);
    }


    settingsClick = () => {
        this.props.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="animation"
                            items={{"2":"Расширенная","1":"Упрощенная","0":"Без анимации"}}
                            selected={this.props.usersettings.animation}
                            placeholder="Анимация"
                            onSelect={this.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Droplist
                            id="difficulty"
                            items={{"3":"Сложно","2":"Среднее","1":"Легко"}}
                            selected={this.props.usersettings.difficulty}
                            placeholder="Сложность бота"
                            onSelect={this.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Slider
                            id="soundvolume"
                            placeholder="Громкость звуков"
                            value={this.props.usersettings.soundvolume}
                            onSet={this.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Slider
                            id="musicvolume"
                            placeholder="Громкость музыки"
                            value={this.props.usersettings.musicvolume}
                            onSet={this.saveSetting}
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="sbtn grey-sbtn" onClick={this.dropSettings}>По умолчанию</div>
                    </div>
                </div>
            </div>,
            "Настройки"
        );
    }
    showAccStat = () => {
        let s = this.props.playerStat;
        let startexp = 0;
        if(s.lvl > 1) startexp = 50*(Math.pow(2,s.lvl-1));
        let endexp = 50*(Math.pow(2,s.lvl));
        let progress = Math.percent(s.exp - startexp,endexp - startexp);
        let left = 50 - parseInt(progress,10)/2;

        this.props.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-12" id="message"></div>
                    <div className="col-12">
                        <h4 style={{margin: "0", border: "0"}}>{s.lvl} уровень</h4>
                        <div className="exp">
                            <div className="progress" style={{width: progress, left: left+"%"}}>{s.exp}</div>
                            <table className="stable" style={{padding: "0px"}}><tbody><tr><td>{startexp}</td><td>{endexp}</td></tr></tbody></table>
                        </div>
                        <table className="stable">
                            <tbody>
                                <tr><td>Опыта до следующего уровня</td><td>{endexp - s.exp}</td></tr>
                                <tr><td>Всего игр</td><td>{s.games}</td></tr>
                                <tr><td>Побед</td><td>{s.won} ({Math.percent(s.won,s.games,2)})</td></tr>
                                <tr><td>Поражений</td><td>{s.lost} ({Math.percent(s.lost,s.games,2)})</td></tr>
                                <tr><td>Ничьих</td><td>{s.games-s.won-s.lost} ({Math.percent(s.games-s.won-s.lost,s.games,2)})</td></tr>
                                <tr><td>Побед/поражений</td><td>{Math.coefficient(s.won,s.lost,2)}</td></tr>
                                <tr><td>Всего ходов</td><td>{s.moves}</td></tr>
                                <tr><td>Всего хопов</td><td>{s.steps}</td></tr>
                                <tr><td>Среднее время в игре</td><td>{Math.round(s.playeravgtime)} с. / {Math.round(s.totalavgtime)} с.</td></tr>
                                <tr><td>Среднее кол-во ходов</td><td>{Math.round(s.playeravgmoves)} / {Math.round(s.totalavgmoves)}</td></tr>
                                <tr><td>Среднее кол-во хопов</td><td>{Math.round(s.playeravgsteps)} / {Math.round(s.totalavgsteps)}</td></tr>
                                <tr><td>Среднее хопов на ход</td><td>{Math.coefficient(s.playeravgsteps,s.playeravgmoves,2)} / {Math.coefficient(s.totalavgsteps,s.totalavgmoves,2)}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>,
            this.props.playerName
        );
    }
    newRegistration = () => {
        this.props.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-12" id="message"></div>
                    <div className="col-12">
                        <input type="text" id="name" placeholder="Отображаемое имя" minLength="3" maxLength="40" />
                    </div>
                    <div className="col-12">
                        <input type="text" id="login" placeholder="Логин" minLength="4" maxLength="30" />
                    </div>
                    <div className="col-12">
                        <input type="password" id="pass" placeholder="Пароль" minLength="6" maxLength="60" />
                    </div>
                    <div className="col-12">
                        <input type="password" id="pass2" placeholder="Повторите пароль" minLength="6" maxLength="60" />
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="sbtn grey-sbtn" onClick={this.gogoRegister}>Зарегистрироваться</div>
                    </div>
                </div>
            </div>,
            "Авторизация"
        );
    }
    gogoRegister = () => {
        let m = document.getElementById("message");
        m.className = "";
        if(document.getElementById("pass").value !== document.getElementById("pass2").value){
            m.className = "error";
            m.innerHTML = "Пароли не совпадают";
            return false;
        }
        let a = document.querySelectorAll("#modal .row input");
        for(let f=0;f<a.length;f++){
            if(a[f].value.length < a[f].minLength || a[f].value.length > a[f].maxLength){
                m.className = "error";
                m.innerHTML = "Поле «"+a[f].placeholder+"» должно быть в диапазоне от "+a[f].minLength+" до "+a[f].maxLength+" символов!";
                return false;
            }
        }
        this.props.XMLHR({action:"register",name:document.getElementById("name").value,login:document.getElementById("login").value,pass:sha1(document.getElementById("pass").value)},(d)=>{
            m.className = d.success?"success":"error";
            m.innerHTML = d.response;
            this.saveSetting("atoken",d.data.token);
            if(d.success) window.location.reload();
        });
    }
    signIn = () => {
        this.props.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-12" id="message"></div>
                    <div className="col-12">
                        <input type="text" id="login" placeholder="Логин" maxLength="30" />
                    </div>
                    <div className="col-12">
                        <input type="password" id="pass" placeholder="Пароль" />
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="sbtn grey-sbtn" onClick={this.gogoSign}>Войти</div>
                    </div>
                </div>
            </div>,
            "Авторизация"
        );
    }
    gogoSign = () => {
        this.props.XMLHR({action:"auth",login:document.querySelector("#login").value,pass:sha1(document.querySelector("#pass").value)},(d)=>{
            let m = document.querySelector("#message");
            m.innerHTML = d.response;
            if(d.success){
                m.className = "success";
                this.saveSetting("atoken",d.data.token);
                window.location.reload();
            }else{
                m.className = "error";
            }
        });
    }
    signOut = () => {
        this.saveSetting("atoken","");
        window.location.reload();
    }
    goHome = () => {
        document.querySelector("#utitle").className = "animate__backOutLeft animate__animated fa-2x";
        document.querySelector(".umaincon").className = "umaincon animate__fadeOutLeft animate__animated";
        this.setState({naviActive: false});
        setTimeout(() => {
            this.props.history.push("/home");
        }, 1000);
    }
    navigatorClick = () => {
        this.setState({naviActive: !this.state.naviActive});
    }
    animationend = (event) => {
        event.target.className = "uhicon";
        event.target.style.animationDelay = "0ms";
    }
    componentDidMount = () => {
        let title = document.getElementById('utitle');
        title.className = "animate__backInLeft animate__animated fa-2x";
        title.addEventListener("animationend",(event) => {
            event.target.className = "fa-2x";
        });
    }
    render(){
        
        let gameclass = "fa fa-gamepad";
        if(this.props.status === "in_game" && this.props.online) gameclass = "fa fa-stop-circle";
        if(this.props.searching) gameclass = "fa fa-ellipsis-h fa-smx-spin";

        let gametitle = "Найти противника";
        if(this.props.status === "in_game" && this.props.online) gametitle = "Выйти из игры";
        if(this.props.searching) gametitle = "Остановить поиск";

        let uhcclass = "fa-2x";
        uhcclass = this.state.naviActive ? "animate__fadeInLeft animate__animated fa-2x" : "animate__fadeOutLeft animate__animated fa-2x";
        if (this.state.naviActive === null) uhcclass = "hidden fa-2x";

        let accDiv = <React.Fragment>
            <div className="uhicon" onClick={this.gameButClick} title={gametitle}><i className={gameclass}></i><span> {gametitle}</span>{this.props.searching?<i style={{width: "35px"}}> {this.props.count}</i>:""}</div>
            <div className="uhicon" onClick={this.settingsClick}><i className="fa fa-sliders-h"></i><span> Настройки</span></div>
        </React.Fragment>;

        if(this.props.playerSigned){
            accDiv = <React.Fragment>
                        <div className="uhicon" onClick={this.showAccStat}><i className="fa fa-id-badge"></i><span> {this.props.playerName}</span></div>
                        {accDiv}
                        <div className="uhicon" onClick={this.signOut}><i className="fa fa-times"></i><span> Выйти из аккаунта</span></div>
                    </React.Fragment>;
        }else{
            accDiv = <React.Fragment>
                        <div className="uhicon" onClick={this.signIn}><i className="fa fa-sign-in-alt"></i><span> Вход</span></div>
                        <div className="uhicon" onClick={this.newRegistration}><i className="fa fa-key"></i><span> Регистрация</span></div>
                        {accDiv}
                    </React.Fragment>;
        }

        accDiv = <div id="uhiconcontainer" className={uhcclass}>
                    <div className="uhicon" onClick={this.goHome}><i className="fa fa-home"></i><span> Главное меню</span></div>
                    {accDiv}
                </div>;

        return (
            <div className="uheader">
                <div id="utitle" className="fa-2x" style={{whiteSpace: "nowrap"}} onClick={this.gameChoice}><i className="fa fa-chess" style={{color: (this.props.online || this.props.searching!==false)?this.props.playerColor:"white"}}> </i> {this.props.gamename}</div>
                {accDiv}
                <div id="navibut" className="uhicon" onClick={this.navigatorClick}><i className="fa fa-bars fa-2x"></i></div>
            </div>
        );
    };
}