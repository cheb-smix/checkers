import React from 'react';
import Lang from '../Localization';
import Button from '../Button';
import "./fanfara.css";
import Noise from '../../Funcs/Noise';

export default class Fanfara extends React.Component {


    state = {
        animated: false
    }

    calcExpForLevel = (LVL = 1) => {
        return LVL > 1 ? Math.floor(window.loft.config.MLTPLR * (Math.pow(window.loft.config.BASE, LVL * window.loft.config.INC))) : 0;
    }

    animate = () => {
        if (this.props.playerInfo.status === window.loft.constants.STATUS_IN_GAME || this.state.animated) return;

        this.setState({ animated: true });

        let pdiv = document.querySelector(".progress");

        // this.props.playerInfo.lastGameStat.points += 200;
        // this.props.playerInfo.lastGameStat.level += 2;

        let newEXP = this.props.playerInfo.statistics.experience + this.props.playerInfo.lastGameStat.points;
        let expDIF = this.props.playerInfo.lastGameStat.points;
        let newLVL = this.props.playerInfo.lastGameStat.level;
        let curLVL = this.props.playerInfo.statistics.level;
        let lvlDIF = this.props.playerInfo.lastGameStat.level - this.props.playerInfo.statistics.level;
        let lvlAnimationInterval = 600;
        let lvlAnimationTtlTime = lvlAnimationInterval * lvlDIF;
        let cntEXP = this.props.playerInfo.statistics.experience;

        document.getElementById("fantext").innerHTML = document.getElementById("fantext").innerHTML + "<br>" + (expDIF < 0 ? Lang("youveLostExpirience") : Lang("youveGotExpirience")).replace("$", Math.abs(expDIF));
        if (lvlDIF > 0) {

            let t = setInterval(() => {}, 1000);
            clearInterval(t);

            setTimeout(() => {
                t = setInterval(() => {
                    pdiv.innerHTML = cntEXP;
                    cntEXP++;
                    if (cntEXP === newEXP) {
                        pdiv.innerHTML = newEXP;
                        clearInterval(t);
                    }
                }, lvlAnimationTtlTime / expDIF);
            }, lvlAnimationInterval);

            let s = setInterval(() => {
                if (lvlDIF > 0) {
                    pdiv.style.transition = "all 0.5s ease";
                    pdiv.style.width = "100%";
                    pdiv.style.left = "0%";
                    lvlDIF--;
                    curLVL++;
                    document.querySelector(".exp").className = 'exp animate__tada';
                    setTimeout(() => {
                        let startexp = this.calcExpForLevel(curLVL);
                        let endexp = this.calcExpForLevel(curLVL + 1);
                        document.querySelector(".stable td:nth-child(1)").innerHTML = startexp;
                        document.querySelector(".stable td:nth-child(2)").innerHTML = endexp;
                        document.querySelector(".exp").classList.toggle('animate__animated');
                        pdiv.style.transition = "none";
                        pdiv.style.width = "0%";
                        pdiv.style.left = "50%";
                        setTimeout(() => {
                            pdiv.style.transition = "all 0.5s ease";
                        }, 30);
                    }, lvlAnimationInterval / 6 * 5);
                } else {
                    let startexp = this.calcExpForLevel(newLVL);
                    let endexp = this.calcExpForLevel(newLVL + 1);
                    let progress = Math.percent(newEXP - startexp, endexp - startexp);
                    pdiv.style.width = progress;
                    pdiv.style.left = (50 - parseInt(progress, 10) / 2) + "%";
                    this.props.rampage(0, "NEW LEVEL " + newLVL + "!");
                    pdiv.innerHTML = newEXP;
                    clearInterval(s);
                    clearInterval(t);
                    this.props.updatePI();
                }
            }, lvlAnimationInterval)
        } else {
            let startexp = this.calcExpForLevel(curLVL);
            let endexp = this.calcExpForLevel(curLVL + 1);
            let progress = Math.percent(newEXP - startexp, endexp - startexp);
            pdiv.style.transition = "all 0.5s ease";
            pdiv.style.width = progress;
            pdiv.style.left = (50 - parseInt(progress, 10) / 2) + "%";
            pdiv.innerHTML = newEXP;
            this.props.updatePI();
        }
        //this.props.showBestMove();
    }

    componentDidMount = () => {
        let f = document.getElementById("fanfara");
        let u = document.getElementById("ufield");
        f.style.top = 0 + "px";
        f.style.left = u.offsetLeft + "px";
    }

    render() {
        let { playerInfo, opponentInfo } = this.props;
        let header = "";
        let text = <p></p>;
        let podtext = "";

        let playersCheckersUnDone = 12 - playerInfo.done;
        let opponentCheckersUnDone = 12 - opponentInfo.done;
        let ppercent = Math.round(playersCheckersUnDone * 100 / 12);
        let opercent = Math.round(opponentCheckersUnDone * 100 / 12);

        let buttons =
            <div className="container" style={{ height: "auto" }}>
                <div className="row">
                    <div className="col-12">
                        <Button
                            action={this.props.quit}
                            href=""
                            value={Lang("closeText")}
                            theme="grey"
                            strong="true"
                        />
                    </div>
                    <div className="col-12">
                        <Button
                            action={this.props.continueWithSameOpponent}
                            href=""
                            value={Lang("continueWith").replace("$", opponentInfo.user.display_name)}
                            theme="neon"
                            strong="true"
                        />
                    </div>
                    <div className="col-12">
                        <Button
                            action={this.props.searchNewOpponent}
                            href=""
                            value={Lang("searchAnotherEnemy")}
                            theme="neon"
                            strong="true"
                        />
                    </div>
                </div>
            </div>;

        let gonnashow = false;

        //if(playerInfo.status!==window.loft.constants.STATUS_WON && playerInfo.status!==window.loft.constants.STATUS_FAIL && playerInfo.status!==window.loft.constants.STATUS_DONE) playerInfo.status = window.loft.constants.STATUS_IN_GAME;

        if (playerInfo.status === window.loft.constants.STATUS_WON) {
            header = Lang("congratulations");
            let diff = opponentCheckersUnDone;
            if (playerInfo.done === 12) {
                podtext = Lang("youCrashedOpponent");
            } else {
                if (opponentInfo.possibilities === 0) {
                    podtext = Lang("youCorneredEnemy");
                    diff = opponentCheckersUnDone - playersCheckersUnDone;
                } else {
                    podtext = Lang("enemyQuit");
                }
            }
            if (opponentInfo.possibilities === 0) {
                if (diff === 1) podtext += Lang("wonOnlyOneChecker");
                if (diff > 1 && diff < 5) podtext += Lang("won2to4checkers").replace("$", diff);
                if (diff > 4) podtext += Lang("won5andMoreCheckers").replace("$", diff);
                podtext += " (" + opercent + "%)!";
            }
            gonnashow = true;

            Noise("victory");
        }
        if (playerInfo.status === window.loft.constants.STATUS_FAIL) {
            header = Lang("regrets");
            if (opponentInfo.done === 12) {
                podtext = Lang("youLooseThisOne");
                if (playersCheckersUnDone === 1) podtext += Lang("lostOnlyOneChecker");
                if (playersCheckersUnDone > 1 && playersCheckersUnDone < 5) podtext += Lang("lost2to4checkers").replace("$", playersCheckersUnDone);
                if (playersCheckersUnDone > 4) podtext += Lang("lost5andMoreCheckers").replace("$", playersCheckersUnDone);
                podtext += " (" + ppercent + "%)!";
            } else {
                podtext = Lang("youveBeenCornered");
            }
            gonnashow = true;

            Noise("fail");
        }
        if (playerInfo.status === window.loft.constants.STATUS_DONE && opponentInfo.status === window.loft.constants.STATUS_DONE) {
            header = Lang("noBadText");
            podtext = Lang("betterThanNothing");
            gonnashow = true;
            Noise("draw");
        }
        if (playerInfo.status === window.loft.constants.STATUS_DONE && opponentInfo.status !== window.loft.constants.STATUS_DONE && playerInfo.done === 12) {
            header = Lang("congratulations");
            text = <p>{Lang("lastEnemyStep")}</p>
            Noise("warning");
        } else {
            text = <React.Fragment><p id="fantext">{podtext}</p>{buttons}</React.Fragment>;
        }

        let expdiv = '';
        
    
        if (gonnashow && typeof (playerInfo.statistics) !== "undefined") {
            let { statistics: s } = playerInfo;

            let startexp = this.calcExpForLevel(s.level);
            let endexp = this.calcExpForLevel(s.level + 1);

            let progress = Math.percent(s.experience - startexp, endexp - startexp);
            let left = 50 - parseInt(progress, 10) / 2;
            if (this.state.animated === false) setTimeout(() => { this.animate() }, 1000);
            expdiv = <div className="exp">
                <div className="progress" style={{ width: progress, left: left + "%" }}>{s.experience}</div>
                <table className="stable" style={{ padding: "0px" }}><tbody><tr><td>{startexp}</td><td>{endexp}</td></tr></tbody></table>
            </div>;
        }
        return (
            <div className={"status" + playerInfo.status} id="fanfara"><br />
                <h3>{header}<br />{playerInfo.user.display_name}<br /></h3>
                {expdiv}
                {text}
            </div>
        );
    }
}