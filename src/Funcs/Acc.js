import Button from "../Components/Button";
import Lang from '../Components/Localization';
import postData from "./PostDataFuncs";
import sha1 from "./Sha1";

import { privacyPolicy, termsConditions } from "../Components/About";

export default class Acc {
    constructor(setAppState = () => { }) {
        this.setAppState = setAppState;
        this.mto = setTimeout(() => {}, 1000);
        clearTimeout(this.mto);
    }

    setMessage = (message, className) => {
        let m = document.querySelector("#message");
        clearTimeout(this.mto);
        if (m) {
            m.className = className;
            m.innerHTML = message;
            this.mto = setTimeout(() => {
                m.className = "";
                m.innerHTML = "";
            }, 5000);
        }
    }

    setAuth = (data) => {
        localStorage.setItem("atoken", data.atoken);
        window.loft.user_info = data.user_info;
        window.loft.atoken = data.atoken;
        window.loft.isGuest = false;
        this.setAppState({ isGuest: false });
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
                    <div className="col-12">
                        <Button
                            action={this.forgotPass}
                            href=""
                            value={Lang("forgotPassword")}
                            theme="link"
                        />
                        <Button
                            action={this.signUp}
                            href=""
                            value={Lang("dontHaveAccount")}
                            theme="link"
                        />
                    </div>
                    <div className="col-12">
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
                username: document.querySelector("#login").value,
                password: sha1(document.querySelector("#pass").value),
            },
            device: window.loft.device,
            success: (d) => {
                if (d.success) {
                    this.setMessage(Lang("success"), "success");
                    this.setAuth(d);
                    window.loft.showModal(false);
                } else {
                    this.setMessage(d.errors[Object.keys(d.errors).shift()], "error");
                }
            }
        });
    }

    signOut = () => {
        postData({
            url: window.loft.apiserver + "sign-out",
            success: (d) => {
                if (d.success) {
                    window.loft.user_info = [];
                    window.loft.isGuest = true;
                    delete window.loft.atoken;
                    localStorage.removeItem("atoken");
                    this.setAppState({ isGuest: true });
                }
            }
        });
    }

    forgotPass = () => {
        window.loft.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-12" id="message"></div>
                    <div className="col-12">
                        <input type="text" id="email" placeholder={Lang("emailText")} minLength="4" maxLength="70" />
                    </div>
                    <div className="col-12">
                        <Button
                            action={this.gogoRessurect}
                            href=""
                            value={Lang("confirm")}
                            theme="neon"
                            strong="true"
                        />
                    </div>
                </div>
            </div>,
            Lang("ressurectingPass")
        );
    }

    gogoRessurect = () => {
        postData({
            url: window.loft.apiserver + "pass-reset",
            data: {
                email: document.querySelector("#email").value,
            },
            success: (d) => {
                if (d.success) {
                    this.setMessage(Lang("email4Instructions"), "success");
                    setTimeout(this.signIn, 5000);
                } else {
                    this.setMessage(Lang("failed"), "error");
                }
            }
        });
    }

    showAccStat = () => {
        /*let s = this.props.playerStat;
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
        );*/
    }

    signUp = () => {
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
                    <div className="col-12">
                        <Button
                            action={this.gogoRegister}
                            href=""
                            value={Lang("signUpText")}
                            theme="neon"
                            strong="true"
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Button
                            action={privacyPolicy}
                            href=""
                            value={Lang("privacyPolicyText")}
                            theme="white"
                            strong="false"
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <Button
                            action={termsConditions}
                            href=""
                            value={Lang("termsConditionsText")}
                            theme="white"
                            strong="false"
                        />
                    </div>
                </div>
            </div>,
            Lang("signUpText")
        );
    }

    gogoRegister = () => {
        let a = document.querySelectorAll("#modal .row input");
        for (let f = 0; f < a.length; f++) {
            if (a[f].value.length < a[f].minLength || a[f].value.length > a[f].maxLength) {
                this.setMessage(Lang("fieldRuleText1").replace("$", a[f].placeholder) + Lang("fieldRuleText2").replace("$", a[f].minLength + "-" + a[f].maxLength), "error");
                return false;
            }
        }
        postData({
            url: window.loft.apiserver + "sign-up",
            data: {
                display_name: document.getElementById("name").value,
                username: document.getElementById("login").value,
                password: sha1(document.getElementById("pass").value),
                email: document.getElementById("email").value,
            },
            device: window.loft.device,
            success: (d) => {
                if (d.success) {
                    this.setMessage(Lang("pincode"), "success");
                    window.loft.showModal(false);
                    setTimeout(() => this.emailConfirm(), 700);
                } else {
                    this.setMessage(d.errors ? d.errors[Object.keys(d.errors).shift()] : Lang("failed"), "error");
                }
            }
        });
    }

    emailConfirm = () => {
        window.loft.showModal(
            <div className="container">
                <div className="row">
                    <div className="col-12" id="message"></div>
                    <div className="col-12">
                        <input type="text" id="pincode" placeholder={Lang("pincodeText")} minLength="6" maxLength="6" />
                    </div>
                    <div className="col-md-6 col-12">
                        <Button
                            action={this.gogoConfirm}
                            href=""
                            value={Lang("finish")}
                            theme="neon"
                            strong="true"
                        />
                    </div>
                </div>
            </div>,
            Lang("pincodeText")
        );
    }

    gogoConfirm = () => {
        let a = document.querySelectorAll("#modal .row input");
        for (let f = 0; f < a.length; f++) {
            if (a[f].value.length < a[f].minLength || a[f].value.length > a[f].maxLength) {
                this.setMessage(Lang("fieldRuleText1").replace("$", a[f].placeholder) + Lang("fieldRuleText2").replace("$", a[f].minLength + "-" + a[f].maxLength), "error");
                return false;
            }
        }
        postData({
            url: window.loft.apiserver + "verify-pin-code/" + document.getElementById("pincode").value,
            success: (d) => {
                if (d.success) {
                    this.setMessage(Lang("success"), "success");
                    this.setAuth(d);
                    window.loft.showModal(false);
                } else {
                    this.setMessage(d.errors ? d.errors[Object.keys(d.errors).shift()] : Lang("failed"), "error");
                }
            }
        });
    }

}