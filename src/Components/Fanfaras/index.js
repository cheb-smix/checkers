import React from 'react';
import Lang from '../Localization';
import Button from '../Button';
import "./fanfara.css";
import Noise from '../../Funcs/Noise';
import RoundProgressBar from '../RoundProgressBar';
import Charts from '../Charts';

export default class Fanfara extends React.Component {

    gamesPlayed = [];

    calcExpForLevel = (LVL = 1) => {
        return LVL > 1 ? Math.floor((window.loft.config.MLTPLR + LVL) * LVL ) : 0;
        //return LVL > 1 ? Math.floor(window.loft.config.MLTPLR * (Math.pow(window.loft.config.BASE, LVL * window.loft.config.INC))) : 0;
    }

    // componentDidMount = () => {
    //     let f = document.getElementById("fanfara");
    //     let u = document.getElementById("ufield");
    //     f.style.top = 0 + "px";
    //     f.style.left = u.offsetLeft + "px";
    // }

    componentDidUpdate = () => {
        if (this.gamesPlayed.indexOf(this.props.game_id) < 0) {
            this.gamesPlayed.push(this.props.game_id);

            window.loft.user_info.stat.total_games++;
            if (this.props.playerInfo.status === window.loft.constants.STATUS_WON) {
                window.loft.user_info.stat.total_wins++;
            } else if (this.props.playerInfo.status === window.loft.constants.STATUS_FAIL) {
                window.loft.user_info.stat.total_failes++;
            } else {
                window.loft.user_info.stat.total_draws++;
            }
            window.loft.user_info.stat.total_steps += window.loft.user_info.lastGameStat.steps;
            window.loft.user_info.stat.total_hops += window.loft.user_info.lastGameStat.hops;
            window.loft.user_info.stat.total_kills += window.loft.user_info.lastGameStat.kills;
            window.loft.user_info.stat.experience += window.loft.user_info.lastGameStat.points;
            window.loft.user_info.coins += window.loft.user_info.lastGameStat.coins;
            if (window.loft.user_info.lastGameStat.level > 1) window.loft.user_info.stat.level = window.loft.user_info.lastGameStat.level;
        }
    }

    render() {
        let { playerInfo, opponentInfo } = this.props;
        let header = "";
        let podtext = "";
        let noise = '';
        let stattext = [];

        let playersCheckersUnDone = 12 - playerInfo.done;
        let opponentCheckersUnDone = 12 - opponentInfo.done;
        let ppercent = Math.round(playersCheckersUnDone * 100 / 12);
        let opercent = Math.round(opponentCheckersUnDone * 100 / 12);
        
        let buttons =
            <div key={-1} className="container" style={{ height: "auto" }}>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <Button
                            action={this.props.newGame}
                            href="#newgame"
                            value={Lang("newGame")}
                            theme="neon"
                            strong="true"
                        />
                        
                    </div>
                    <div className="col-12 col-md-6">
                        <Button
                            action=""
                            href="/home"
                            value={Lang("homePageText")}
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

        if (this.props.game_status !== window.loft.constants.STATUS_ACTIVE) {            

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

            let stat = window.loft.user_info.lastGameStat;

            if (stat.points) {
                let crntLevelPoint = this.calcExpForLevel(window.loft.user_info.stat.level);
                let nextLevelPoint = this.calcExpForLevel(window.loft.user_info.stat.level + 1);
                let sdiff = window.loft.user_info.stat.experience - crntLevelPoint;
                sdiff = Math.round(100 * sdiff / (nextLevelPoint - crntLevelPoint));
                let initPerc = Math.round(100 * (window.loft.user_info.stat.experience - crntLevelPoint - stat.points) / (nextLevelPoint - crntLevelPoint));

                stattext.push(<RoundProgressBar 
                    key={stattext.length} 
                    index={stattext.length}
                    initPerc={initPerc}
                    perc={sdiff} 
                    num={window.loft.user_info.stat.experience} 
                    text={Lang("pointsStatText").replace("$", stat.points)} 
                    tooltip={Lang("youveGotExpirience").replace("$", stat.points)}
                />);

                stattext.push(<RoundProgressBar 
                    key={stattext.length} 
                    index={stattext.length}
                    initPerc={initPerc}
                    theme="rpb-green"
                    perc={sdiff} 
                    num={stat.level} 
                    text={sdiff > 100 ? Lang("newLevelText") : Lang("levelText")} 
                    tooltip={sdiff > 100 ? Lang("newLevelText") : Lang("levelText")}
                />);
            }

            if (stat.time) {
                let sdiff = window.loft.serverInfo.gameavgstat.time - stat.time;
                sdiff = Math.round(100 * sdiff / window.loft.serverInfo.gameavgstat.time);

                stattext.push(<RoundProgressBar 
                    key={stattext.length} 
                    index={stattext.length}
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
                    index={stattext.length}
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
                    index={stattext.length}
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
                    index={stattext.length}
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
                    index={stattext.length}
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
                    index={stattext.length}
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
                    index={stattext.length}
                    perc={sdiff + 100} 
                    num={killLossCoeff} 
                    text={Lang("killLossCoeffText").replace("$", sdiff >= 1 ? '+' + sdiff + '%' : '')} 
                    tooltip={sdiff >= 1 ? Lang("gameStatCompareText").replace("$", sdiff) : (sdiff + 100) + '%'}
                />);
            }

            // if (stat.coins) {
            //     stattext.push(<p key={stattext.length} className="fanp">{Lang("coinStatText").replace("$", stat.coins)}</p>);
            // }

            if (playerInfo.status === window.loft.constants.STATUS_DONE && opponentInfo.status !== window.loft.constants.STATUS_DONE && playerInfo.done === 12) {
                header = Lang("congratulations");
                stattext = [<p key="0" className="fanp">{Lang("lastEnemyStep")}</p>];
                noise = "warning";
            } else {
                if (window.loft.chartLength > 1) {
                    stattext.unshift(<Charts 
                        data={window.loft.chart} 
                        key={stattext.length} 
                        colors={['#f40', 'green', '#08f', '#eeff00']}
                        font="1.4vh Federo"
                        dots="false"
                        chart={this.props.game_status !== window.loft.constants.STATUS_ACTIVE}
                        />
                    );
                }
                stattext.unshift(buttons);
                stattext.unshift(<p key={stattext.length} style={{textAlign: "center"}} className="fanp">{podtext}</p>);
            }    

            if (noise) Noise(noise);
        }
        
        return (
            <div className={"status" + this.props.game_status} id="fanfara"><br />
                <h3>{header}{playerInfo.display_name ? ', ' + playerInfo.display_name : ''}</h3>
                {stattext}
            </div>
        );
    }
}