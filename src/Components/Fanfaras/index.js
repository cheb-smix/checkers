import React from 'react';
import Lang from '../Localization';
import Button from '../Button';
import "./fanfara.css";
import Noise from '../../Funcs/Noise';
import RoundProgressBar from '../RoundProgressBar';
import Charts from '../Charts';

export default class Fanfara extends React.Component {


    state = {
        initiated: this.props.playerInfo.status === window.loft.constants.STATUS_IN_GAME,
    }

    calcExpForLevel = (LVL = 1) => {
        return LVL > 1 ? Math.floor((window.loft.config.MLTPLR + LVL) * LVL ) : 0;
        //return LVL > 1 ? Math.floor(window.loft.config.MLTPLR * (Math.pow(window.loft.config.BASE, LVL * window.loft.config.INC))) : 0;
    }

    animate = () => {
        // if (this.props.playerInfo.status === window.loft.constants.STATUS_IN_GAME || this.state.animated) return;

        // this.setState({ animated: true, chart: true});

        // let pdiv = document.querySelector(".progress");

        // let {lastGameStat: stat} = this.props.playerInfo;

        // let newEXP = this.props.playerInfo.statistics.experience + stat.points;
        // let expDIF = stat.points;
        // let newLVL = stat.level;
        // let curLVL = this.props.playerInfo.statistics.level;
        // let lvlDIF = stat.level - this.props.playerInfo.statistics.level;
        // let lvlAnimationInterval = 600;
        // let lvlAnimationTtlTime = lvlAnimationInterval * lvlDIF;
        // let cntEXP = this.props.playerInfo.statistics.experience;

        
        // if (lvlDIF > 0) {

        //     let t = setInterval(() => {}, 1000);
        //     clearInterval(t);

        //     setTimeout(() => {
        //         t = setInterval(() => {
        //             pdiv.innerHTML = cntEXP;
        //             cntEXP++;
        //             if (cntEXP === newEXP) {
        //                 pdiv.innerHTML = newEXP;
        //                 clearInterval(t);
        //             }
        //         }, lvlAnimationTtlTime / expDIF);
        //     }, lvlAnimationInterval);

        //     let s = setInterval(() => {
        //         if (lvlDIF > 0) {
        //             pdiv.style.transition = "all 0.5s ease";
        //             pdiv.style.width = "100%";
        //             pdiv.style.left = "0%";
        //             lvlDIF--;
        //             curLVL++;
        //             document.querySelector(".exp").className = 'exp animate__tada';
        //             setTimeout(() => {
        //                 let startexp = this.calcExpForLevel(curLVL);
        //                 let endexp = this.calcExpForLevel(curLVL + 1);
        //                 document.querySelector(".stable td:nth-child(1)").innerHTML = startexp;
        //                 document.querySelector(".stable td:nth-child(2)").innerHTML = endexp;
        //                 document.querySelector(".exp").classList.toggle('animate__animated');
        //                 pdiv.style.transition = "none";
        //                 pdiv.style.width = "0%";
        //                 pdiv.style.left = "50%";
        //                 setTimeout(() => {
        //                     pdiv.style.transition = "all 0.5s ease";
        //                 }, 30);
        //             }, lvlAnimationInterval / 6 * 5);
        //         } else {
        //             let startexp = this.calcExpForLevel(newLVL);
        //             let endexp = this.calcExpForLevel(newLVL + 1);
        //             let progress = Math.percent(newEXP - startexp, endexp - startexp);
        //             pdiv.style.width = progress;
        //             pdiv.style.left = (50 - parseInt(progress, 10) / 2) + "%";
        //             this.props.rampage(0, "NEW LEVEL " + newLVL + "!");
        //             pdiv.innerHTML = newEXP;
        //             clearInterval(s);
        //             clearInterval(t);
        //             // this.props.updatePI();
        //         }
        //     }, lvlAnimationInterval)
        // } else {
        //     let startexp = this.calcExpForLevel(curLVL);
        //     let endexp = this.calcExpForLevel(curLVL + 1);
        //     let progress = Math.percent(newEXP - startexp, endexp - startexp);
        //     pdiv.style.transition = "all 0.5s ease";
        //     pdiv.style.width = progress;
        //     pdiv.style.left = (50 - parseInt(progress, 10) / 2) + "%";
        //     pdiv.innerHTML = newEXP;
        //     // this.props.updatePI();
        // }
        // //this.props.showBestMove();
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
        let podtext = "";
        let noise = '';

        let playersCheckersUnDone = 12 - playerInfo.done;
        let opponentCheckersUnDone = 12 - opponentInfo.done;
        let ppercent = Math.round(playersCheckersUnDone * 100 / 12);
        let opercent = Math.round(opponentCheckersUnDone * 100 / 12);

        let buttons =
            <div key={-1} className="container" style={{ height: "auto" }}>
                <div className="row">
                    <div className="col-12">
                        <Button
                            action=""
                            href="/home"
                            value={Lang("closeText")}
                            theme="grey"
                            strong="true"
                        />
                    </div>
                    {/* <div className="col-12">
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
                    </div> */}
                </div>
            </div>;

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
            noise = "victory";
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
            noise = "fail";
        }
        if (playerInfo.status === window.loft.constants.STATUS_DONE && opponentInfo.status === window.loft.constants.STATUS_DONE) {
            header = Lang("noBadText");
            podtext = Lang("betterThanNothing");
            noise = "draw";
        }

        let {lastGameStat: stat} = this.props.playerInfo;
        let stattext = [];

        if (stat.points) {
            let nextLevelPoint = this.calcExpForLevel(this.props.playerInfo.statistics.level + 1);
            let sdiff = nextLevelPoint - this.props.playerInfo.statistics.experience + stat.points;
            sdiff = Math.round(100 * sdiff / nextLevelPoint);

            stattext.push(<RoundProgressBar 
                key={stattext.length} 
                perc={sdiff + 100} 
                num={this.props.playerInfo.statistics.experience + stat.points} 
                text={Lang("pointsStatText").replace("$", stat.points)} 
                tooltip={Lang("youveGotExpirience").replace("$", stat.points)}
            />);

            stattext.push(<RoundProgressBar 
                key={stattext.length} 
                perc={sdiff + 100} 
                num={stat.level} 
                text={stat.level > this.props.playerInfo.statistics.level ? Lang("newLevelText") : Lang("levelText")} 
                tooltip={stat.level > this.props.playerInfo.statistics.level ? Lang("newLevelText") : Lang("levelText")}
                forceClasses="rpb-green"
            />);
        }

        if (stat.time) {
            let sdiff = window.loft.serverInfo.gameavgstat.time - stat.time;
            sdiff = Math.round(100 * sdiff / window.loft.serverInfo.gameavgstat.time);

            stattext.push(<RoundProgressBar 
                key={stattext.length} 
                perc={sdiff + 100} 
                num={Math.time(stat.time)} 
                text={Lang("timeStatText").replace("$", sdiff >= 1 ? '-' + sdiff + '%' : '')} 
                tooltip={sdiff >= 1 ? Lang("gameStatCompareText").replace("$", sdiff) : (sdiff + 100) + '%'}
            />);
        }
        if (stat.steps) {
            let sdiff = window.loft.serverInfo.gameavgstat.steps - stat.steps;
            sdiff = Math.round(100 * sdiff / window.loft.serverInfo.gameavgstat.steps);

            stattext.push(<RoundProgressBar 
                key={stattext.length} 
                perc={sdiff + 100} 
                num={stat.steps} 
                text={Lang("stepStatText").replace("$", sdiff >= 1 ? '-' + sdiff + '%' : '')} 
                tooltip={sdiff >= 1 ? Lang("gameStatCompareText").replace("$", sdiff) : (sdiff + 100) + '%'}
            />);
        }
        if (stat.hops) {

            let sdiff = stat.hops - window.loft.serverInfo.gameavgstat.hops;
            sdiff = Math.round(100 * sdiff / window.loft.serverInfo.gameavgstat.hops);

            stattext.push(<RoundProgressBar 
                key={stattext.length} 
                perc={sdiff + 100} 
                num={stat.hops} 
                text={Lang("hopStatText").replace("$", sdiff >= 1 ? '+' + sdiff + '%' : '')} 
                tooltip={sdiff >= 1 ? Lang("gameStatCompareText").replace("$", sdiff) : (sdiff + 100) + '%'}
            />);

            let hopsPerStep = Math.pround(stat.hops / stat.steps, 2);
            let hopsPerStep2 = window.loft.serverInfo.gameavgstat.hops / window.loft.serverInfo.gameavgstat.steps;

            sdiff = stat.hops / stat.steps - hopsPerStep2;
            sdiff = Math.round(100 * sdiff / hopsPerStep2);

            stattext.push(<RoundProgressBar 
                key={stattext.length} 
                perc={sdiff + 100} 
                num={hopsPerStep} 
                text={Lang("hopsPerStepText").replace("$", sdiff >= 1 ? '+' + sdiff + '%' : '')} 
                tooltip={sdiff >= 1 ? Lang("gameStatCompareText").replace("$", sdiff) : (sdiff + 100) + '%'}
            />);
        }
        if (stat.kills >= 0) {
            let sdiff = stat.kills - window.loft.serverInfo.gameavgstat.kills;
            sdiff = Math.round(100 * sdiff / window.loft.serverInfo.gameavgstat.kills);

            stattext.push(<RoundProgressBar 
                key={stattext.length} 
                perc={sdiff + 100} 
                num={stat.kills} 
                text={Lang("killStatText").replace("$", sdiff >= 1 ? '+' + sdiff + '%' : '')} 
                tooltip={sdiff >= 1 ? Lang("gameStatCompareText").replace("$", sdiff) : (sdiff + 100) + '%'}
            />);
        }
        if (stat.losses >= 0) {
            let sdiff = window.loft.serverInfo.gameavgstat.losses - stat.losses;
            sdiff = Math.round(100 * sdiff / window.loft.serverInfo.gameavgstat.losses);

            stattext.push(<RoundProgressBar 
                key={stattext.length} 
                perc={sdiff + 100} 
                num={stat.losses} 
                text={Lang("lossStatText").replace("$", sdiff >= 1 ? '-' + sdiff + '%' : '')} 
                tooltip={sdiff >= 1 ? Lang("gameStatCompareText").replace("$", sdiff) : (sdiff + 100) + '%'}
            />);

            let killLossCoeff = Math.pround(stat.kills / stat.losses, 2);
            let killLossCoeff2 = window.loft.serverInfo.gameavgstat.kills / window.loft.serverInfo.gameavgstat.losses;
            sdiff = stat.kills / stat.losses - killLossCoeff2;
            sdiff = Math.round(100 * sdiff / killLossCoeff2);

            stattext.push(<RoundProgressBar 
                last="true"
                key={stattext.length} 
                perc={sdiff + 100} 
                num={killLossCoeff} 
                text={Lang("killLossCoeffText").replace("$", sdiff >= 1 ? '+' + sdiff + '%' : '')} 
                tooltip={sdiff >= 1 ? Lang("gameStatCompareText").replace("$", sdiff) : (sdiff + 100) + '%'}
            />);
        }
        if (stat.coins) {
            stattext.push(<p key={stattext.length} className="fanp">{Lang("coinStatText").replace("$", stat.coins)}</p>);
        }
        // if (stat.level > this.props.playerInfo.statistics.level) {
        //     stattext.push(<p key={stattext.length} className="fanp yellow">{Lang("newLevelText").replace("$", stat.level)}</p>);
        // }

        if (playerInfo.status === window.loft.constants.STATUS_DONE && opponentInfo.status !== window.loft.constants.STATUS_DONE && playerInfo.done === 12) {
            header = Lang("congratulations");
            stattext = [<p key="0" className="fanp">{Lang("lastEnemyStep")}</p>];
            noise = "warning";
        } else {
            // stattext.unshift(<p key={stattext.length} style={{textAlign: "center"}} className="fanp">{(stat.points < 0 ? Lang("youveLostExpirience") : Lang("youveGotExpirience")).replace("$", Math.abs(stat.points))}</p>);
            stattext.unshift(<p key={stattext.length} style={{textAlign: "center"}} className="fanp">{podtext}</p>);
            stattext.push(buttons);
        }    
        
        if (noise) Noise(noise);
    
        // if (noise && React.isset(playerInfo.statistics)) {
        //     let { statistics: s } = playerInfo;

        //     let startexp = this.calcExpForLevel(s.level);
        //     let endexp = this.calcExpForLevel(s.level + 1);

        //     let progress = Math.percent(s.experience - startexp, endexp - startexp);
        //     let left = 50 - parseInt(progress, 10) / 2;
        //     if (this.state.animated === false) setTimeout(() => { this.animate() }, 100);
        //     stattext.unshift(<div key={stattext.length} className="exp">
        //         <div className="progress" style={{ width: progress, left: left + "%" }}>{s.experience}</div>
        //         <table className="stable" style={{ padding: "0px" }}><tbody><tr><td>{startexp}</td><td>{endexp}</td></tr></tbody></table>
        //     </div>);
        //     Noise(noise);
        // }
        
        return (
            <div className={"status" + playerInfo.status} id="fanfara"><br />
                <h3>{header}{playerInfo.user.display_name ? ', ' + playerInfo.user.display_name : ''}</h3>
                { Object.keys(window.loft.chart).length > 0 ? 
                <Charts 
                data={window.loft.chart} 
                colors={['#f40', 'green', '#08f', '#eeff00']}
                font="1.4vh Federo"
                dots="false"
                chart={this.state.initiated}
                /> : '' }
                {stattext}
            </div>
        );
    }
}