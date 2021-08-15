import React from 'react';

import AppHeader from '../AppHeader/';
import Cell from '../Cell/';
import Console from '../Console/';
import Fanfara from '../Fanfaras';
import Rampage from '../Rampage';
import Button from '../Button';
import Lang from '../Localization';
import postData from '../../Funcs/PostDataFuncs';
import Noise from '../../Funcs/Noise';

import './app.css';
import Socket from '../../Funcs/Socket';

export default class App extends React.Component {

    INT = 0;

    STATUS_IN_GAME = 0;
    STATUS_DONE = 5;
    STATUS_FAIL = 6;
    STATUS_WON = 7;
    STATUS_DRAW = 8;

    timer = null;
    clicks = 0;
    delay = 200;

    state = {
        /* USERS DYNAMIC INFO */
        cells: {},
        bestMove: null,
        playerInfo: {
            user: {
                display_name: window.loft.user_info.display_name,
                username: window.loft.user_info.username,
            },
            status: window.loft.constants.STATUS_IN_GAME,
            color: 1,
            done: 0,
            possibilities: 10,
        },
        opponentInfo: {
            user: {
                display_name: "bot" + Math.round(Math.random() * 1000 + 1000),
                username: false,
            },
            status: window.loft.constants.STATUS_IN_GAME,
            color: 0,
            done: 0,
            possibilities: 10,
        },
        game: window.loft.usersettings.game,
        /* TECH INFO */
        selectedChecker: false,
        playersStep: true,
        lastStep: "",
        lastStepTime: 0,
        animationSpeed: 45,
        online: false,
        botspeed: 1,
        playstage: 1,
        consoleText: "",
        rampageCode: "",
        rampageTO: null,
        targetCells: {},
        searchingOnlineOpponent: false,
        searchingOnlineCounter: 0,
        timeoutCheckInterval: false,
        timeoutCounter: window.loft.config.StepTimeLimit * 0.98,

        /* DEV FIELDS */
        botStepBuffer: null,
        autochess: false,
        game_id: 0,
        game_status: window.loft.constants.STATUS_ACTIVE,
    };

    componentDidMount() {
        if (window.cordova) {
            window.loft.removeAllListeners(document, "backbutton");
            window.loft.addListener(document, "backbutton", () => {
                if (this.state.online) {
                    this.quitGameConfirmer(navigator.app.backHistory);
                } else if (this.state.searchingOnlineOpponent) {
                    this.stopTheSearch();
                    navigator.app.backHistory();
                } else {
                    navigator.app.backHistory();
                }
            }, false);
        }
        this.initiation(true);
    }

    initiation = (playersInfoInitNeeded = false) => {

        let state = this.clearPlayerInfoAfterGameOver({}, true);

        if (window.loft.usersettings.mode === "bot") {
            if (Math.random() > 0.5) {
                state.playerInfo.color = 1;
                state.opponentInfo.color = 0;
            } else {
                state.playerInfo.color = 0;
                state.opponentInfo.color = 1;
            }
            state.playersStep = state.playerInfo.color === 1;
        }

        if (playersInfoInitNeeded) {
            state.playerInfo.user.display_name = window.loft.user_info.display_name;
            state.playerInfo.user.username = window.loft.user_info.username;
            if (this.state.autochess) state.playerInfo.user.display_name = "bot" + Math.round(Math.random() * 1000 + 1000);
        }

        if (window.loft.usersettings.mode === "bot") {
            if (window.loft.AjaxAvailable) {
                postData({
                    url: window.loft.apiserver + "start-bot-game",
                    success: (res) => {
                        if (res.success && res.game) {
                            this.startGame(res.game);
                        }
                    },
                    error: () => {
                        if (this.state.autochess || !state.playersStep) setTimeout(() => this.botStep(0), 300);
                    }
                });
            } else {
                if (this.state.autochess || !state.playersStep) setTimeout(() => this.botStep(0), 300);
            }
        }

        if (window.loft.usersettings.mode === "online") {
            if (window.loft.socket === null) {
                window.loft.socket = new Socket(this.state.playerInfo.user.display_name, window.loft.usersettings.game, this.dataRecieved);
                state.searchingOnlineOpponent = true;
            }
            setTimeout(this.startNewSearch, 1000);
        }

        this.setStateUpdate(state);
    }






    // Working with server

    // Main wrap

    act = (o = {}) => {
        if (window.loft.socket && window.loft.socket.socketOpened) {
            console.log("socket!");
            // window.loft.socket.send(JSON.stringify(o.data), o.success);
        } else if (window.loft.AjaxAvailable) {
            postData({
                url: window.loft.apiserver + o.action + (React.isset(o.id) ? `/${o.id}` : ""),
                data: o.data,
                success: o.success
            });
        }
    }

    startNewSearch = () => {
        this.act({
            action: 'search/' + window.loft.usersettings.game,
            success: (res) => {
                if (res.success && res.game) {
                    this.startGame(res.game);
                } else {
                    this.startCheckingSearchInterval();
                }
                window.loft.showModal(false);
            }
        });
    }

    startCheckingSearchInterval = () => {
        clearInterval(this.INT);
        this.INT = setInterval(() => {
            this.setStateUpdate({
                searchingOnlineOpponent: true,
                searchingOnlineCounter: this.state.searchingOnlineCounter + 1,
            });

            if (window.loft.socket && window.loft.socket.socketOpened) {
                console.log("waiting for enemy by socket!");
            } else {
                if (this.state.searchingOnlineCounter % 4 === 0) {
                    postData({
                        url: window.loft.apiserver + "check-search",
                        success: (res) => {
                            if (res.success && res.game) {
                                this.stopCheckingSearchInterval();
                                this.startGame(res.game);
                            }
                        }
                    });
                }
            }
        }, 1000)
    }

    stopCheckingSearchInterval = () => {
        clearInterval(this.INT);
        this.setStateUpdate({
            searchingOnlineOpponent: false,
            searchingOnlineCounter: 0,
        });
    }

    stopTheSearch = () => {
        this.stopCheckingSearchInterval();
        this.act({
            action: 'stop-search'
        });
    }

    quit = () => {
        this.act({
            action: 'quit'
        });
    }

    startGame = (game) => {
        let playersStep = game.players.player.color === 1;

        let { playerInfo, opponentInfo } = this.state;

        let keys = ["color", "cells", "done", "possibilities"]; 
        for (let i in keys) {
            let key = keys[i];
            if (React.isset(game.players.player[key])) {
                playerInfo[key] = game.players.player[key];
            }
            if (React.isset(game.players.opponent[key])) {
                opponentInfo[key] = game.players.opponent[key];
            }
        }
        if (!React.empty(game.players.player.user)) playerInfo.user = game.players.player.user;
        if (!React.empty(game.players.opponent.user)) opponentInfo.user = game.players.opponent.user;

        let newState = {
            playersStep: playersStep,
            playerInfo: playerInfo,
            lastStepTime: game.lastStepTime,
            consoleText: (playersStep ? Lang("yourTurnText") : Lang("enemyTurnText")),
            online: false,
            cells: this.dropCheckersToDefaults(),
            searchingOnlineOpponent: false,
            searchingOnlineCounter: 0,
            game_id: game.game_id,
        };

        if (game.players.opponent.device_id > 0) {
            newState.online = true;
            newState.opponentInfo = game.players.opponent;
        } else {
            opponentInfo.color = playersStep ? 0 : 1;
            newState.opponentInfo = opponentInfo;
        }

        this.setStateUpdate(newState);

        clearInterval(this.INT);

        if (this.state.online) {
            this.INT = setInterval(() => {
                if (this.state.online && this.state.playerInfo.status === window.loft.constants.STATUS_IN_GAME && this.state.lastStepTime > 0) {

                    let r = Math.floor(new Date().getTime() / 1000) - this.state.lastStepTime;

                    if (window.loft.socket && window.loft.socket.socketOpened) {
                        if (r > window.loft.config.StepTimeLimit) {
                            this.checkStep(this.state.playersStep ? "game-status" : "check-step", r);
                        } else {
                            this.checkTOI(r);
                        }
                    } else {
                        if (r % 5 === 0) {
                            this.checkStep(this.state.playersStep ? "game-status" : "check-step", r);
                        } else {
                            this.checkTOI(r);
                        }
                    }

                }
            }, 1000);
        } else {
            if (this.state.autochess || !playersStep) setTimeout(() => this.botStep(0), 300);
        }
    }

    checkTOI = (r) => {
        if (r > window.loft.config.StepTimeLimit * 2 / 3) {
            // this.consoleLog((this.state.playersStep ? Lang("yourTurnText") : Lang("enemyTurnText")));
            this.setState({timeoutCounter: window.loft.config.StepTimeLimit - r});
        }
        if (r > window.loft.config.StepTimeLimit) {
            this.setState({timeoutCounter: window.loft.config.StepTimeLimit});
            if (!this.state.playersStep) {
                this.suggestNewOneGame(Lang("enemyLostByTimeout"));
            }
            this.consoleLog(Lang("gameOverByTimeout"));
            clearInterval(this.INT);
        }
    }

    checkStep = (action, r) => {
        this.act({
            action: action,
            data: { game_id: this.state.game_id },
            success: (res) => {
                if (res.success) {
                    this.procedureResData(res);
                } else {
                    console.log(res);
                }
                this.checkTOI(r);
            }
        });
    }

    procedureResData = (res) => {

        let newState = {};

        if (React.isset(res.chart) && !React.empty(res.chart)) {
            for (let k in res.chart) {
                if (!React.isset(window.loft.chart[k])) window.loft.chart[k] = {};
                for (let d in res.chart[k]) {
                    window.loft.chart[k][d] = res.chart[k][d];
                }
                window.loft.chart.length = Object.keys(window.loft.chart[k]).length;
            }
        }

        if (React.isset(res.botstep) && !React.empty(res.botstep)) {
            if (React.isset(this.state.cells[res.botstep.from].possibilities[res.botstep.to])) {
                newState.botStepBuffer = res.botstep;
            }
        }

        if (React.isset(res.lastGameStat)) {
            for (let k in res.lastGameStat) window.loft.user_info.lastGameStat[k] = res.lastGameStat[k];
        }

        if (React.isset(res.game_results)) {
            if (res.game_results.status === window.loft.constants.STATUS_NOMANS) {
                let { playerInfo, opponentInfo } = this.state;
                playerInfo.status = window.loft.constants.STATUS_DRAW;
                opponentInfo.status = window.loft.constants.STATUS_DRAW;

                newState.playerInfo = playerInfo;
                newState.opponentInfo = opponentInfo;
                newState.game_status = res.game_results.status;

                clearInterval(this.INT);
            } else if (res.game_results.status === window.loft.constants.STATUS_FINISHED) {
                let { playerInfo, opponentInfo } = this.state;
                if (res.game_results.winner === window.loft.device.id) {
                    playerInfo.status = window.loft.constants.STATUS_WON;
                    opponentInfo.status = window.loft.constants.STATUS_FAIL;
                } else {
                    playerInfo.status = window.loft.constants.STATUS_FAIL;
                    opponentInfo.status = window.loft.constants.STATUS_WON;
                }

                newState.playerInfo = playerInfo;
                newState.opponentInfo = opponentInfo;
                newState.game_status = res.game_results.status;

                clearInterval(this.INT);
            }
        }

        if (React.isset(res.lastStep)) {
            newState.lastStepTime = res.lastStep.timestamp;
            this.doStep(
                res.lastStep.to,
                res.lastStep.from,
                res.lastStep.color !== this.state.playerInfo.color,
                false
            );
        }

        this.setStateUpdate(newState);
    }

    getBotStep = (color) => {
        this.act({
            action: 'get-bot-step',
            data: {
                playstage: window.loft.config.Debug ? 3 : this.state.playstage,
                mask: this.getDeskMask(this.state.cells, true),
                color: color
            },
            success: (res) => {
                if (!res.success) {
                    this.iiStep(color);
                } else {
                    if (this.state.cells[res.botstep.from].color === color && React.isset(this.state.cells[res.botstep.from].possibilities[res.botstep.to])) {
                        this.doStep(res.botstep.to, res.botstep.from, true, true, true);
                    } else {
                        this.iiStep(color);
                    }
                }
            }
        });
    }

    saveStepResults = (koordsto, koordsfrom, botstep) => {
        let { cells } = this.state;
        if (this.state.game_id) {
            if (!React.isset(cells[koordsfrom].possibilities[koordsto])) {
                console("WARNING!!! NO POSSIBILITY OR WHAT?", koordsto, cells[koordsfrom].possibilities);
            }
            
            this.act({
                action: 'set-step',
                data: {
                    mask: this.getDeskMask(this.state.cells, true),
                    from: koordsfrom,
                    to: koordsto,
                    // kills: kills.join('-'),
                    // path: cells[koordsfrom].possibilities[koordsto].path.join('-'),
                    game_id: this.state.game_id,
                    botstep: botstep,
                },

                success: (res) => {
                    if (!res.success) {
                        alert(res.errors.shift());
                    } else {
                        this.procedureResData(res);
                    }
                }
            });
        }
    }






    // OnDataRecieved


    dataRecieved = (response) => {
        let data = JSON.parse(response);
        if (React.isset(data.serverInfo)) {
            window.loft.serverInfo = data.serverInfo;
        }
        if (React.isset(data.game)) {
            clearInterval(this.state.searchingOnlineOpponent);
            let playersStep = data.game.players.player.color === 1;
            let colorInfo = Lang(`${data.game.players.player.color}IsYours`);

            let {playerInfo, opponentInfo} = this.state;
            
            let keys = ["color", "cells", "done", "possibilities"]; 
            for (let i in keys) {
                let key = keys[i];
                if (React.isset(data.game.players.player[key])) {
                    playerInfo[key] = data.game.players.player[key];
                }
                if (React.isset(data.game.players.opponent[key])) {
                    opponentInfo[key] = data.game.players.opponent[key];
                }
            }
            if (!React.empty(data.game.players.player.user)) playerInfo.user = data.game.players.player.user;
            if (!React.empty(data.game.players.opponent.user)) opponentInfo.user = data.game.players.opponent.user;

            let newStateObject = {
                playersStep: playersStep,
                lastStep: data.lastStep,
                lastStepTime: data.lastStepTime,
                opponentInfo: opponentInfo,
                playerInfo: playerInfo,
                consoleText: (playersStep ? Lang("yourTurnText") : Lang("enemyTurnText")) + colorInfo,
                online: true,
                cells: this.dropCheckersToDefaults(),
                searchingOnlineOpponent: false,
                searchingOnlineCounter: 0,
                timeoutCheckInterval: setInterval(() => {
                    if (this.state.online && this.state.playerInfo.status === window.loft.constants.STATUS_IN_GAME && this.state.lastStepTime > 0) {
                        let r = Math.floor(new Date().getTime() / 1000) - this.state.lastStepTime;
                        if (r > window.loft.config.StepTimeLimit * 2 / 3) {
                            // this.consoleLog((this.state.playersStep ? Lang("yourTurnText") : Lang("enemyTurnText")) + (window.loft.config.StepTimeLimit - r));
                            this.setState({timeoutCounter: window.loft.config.StepTimeLimit - r});
                        }
                        if (r > window.loft.config.StepTimeLimit) {
                            this.setState({timeoutCounter: window.loft.config.StepTimeLimit});
                            if (!this.state.playersStep) {
                                this.socketSend({ action: "TIMEOUTOPPO" });
                                this.suggestNewOneGame(Lang("enemyLostByTimeout"));
                            }
                            this.consoleLog(Lang("gameOverByTimeout"));
                            clearInterval(this.state.timeoutCheckInterval);
                        }
                    }
                }, 1000)
            }
            this.setStateUpdate(newStateObject);
            return;
        }
        /*if(response.response==="REGISTERED"){
            if(data!==null){
                let {playerInfo} = this.state;
                for(let k in data){
                    playerInfo[k] = data[k];
                }
                this.setStateUpdate({ playerInfo: playerInfo});
            }
            return;
        }
        
        if(response.response==="OPPOQUIT"){
            let {playerInfo,opponentInfo} = this.state;
            playerInfo['status'] = data[this.state.playerInfo.token]['status'];
            opponentInfo['status'] = data[this.state.opponentInfo.token]['status'];
            playerInfo['done'] = data[this.state.playerInfo.token]['done'];
            opponentInfo['done'] = data[this.state.opponentInfo.token]['done'];
            this.setStateUpdate({playerInfo:playerInfo,opponentInfo:opponentInfo});
        }
        if(response.response==="THESTEP"){
            const a = this.state.cells[data.from].possibilities[data.to];

            if(React.isset(a)){
                let o = {
                    lastStep: data.lastStep,
                    lastStepTime: data.lastStepTime
                };
                if(React.isset(data[this.state.playerInfo.token]) && (data[this.state.playerInfo.token]['status'] !== this.state.playerInfo['status'] || this.state.opponentInfo['status'] !== data[this.state.opponentInfo.token]['status'])){
                    //let {playerInfo, opponentInfo} = this.state;
                    o.playerInfo = this.state.playerInfo;
                    o.opponentInfo = this.state.opponentInfo;
                    o.playerInfo['status'] = data[this.state.playerInfo.token]['status'];
                    o.opponentInfo['status'] = data[this.state.opponentInfo.token]['status'];
                    o.playerInfo['done'] = data[this.state.playerInfo.token]['done'];
                    o.opponentInfo['done'] = data[this.state.opponentInfo.token]['done'];
                }
                this.setStateUpdate(o);

                this.doStep(
                    data.to,
                    data.from,
                    data.lastStep!==this.state.playerInfo.token
                );
                
            }
            return;
        }
        if(response.response==="GAMEOVER"){
            if(response.data.reason === "OPPOTIMEOUT"){
                clearInterval(this.state.timeoutCheckInterval);
                this.setStateUpdate({
                    timeoutCheckInterval: false,
                    online: false,
                    consoleText: Lang("enemyLostByTimeout")
                });
            }
            if(response.data.reason === "TIMEOUT"){
                clearInterval(this.state.timeoutCheckInterval);
                this.setStateUpdate({
                    timeoutCheckInterval: false,
                    online: false,
                    consoleText: Lang("youveLostByTimeout")
                });
            }
        }
        this.consoleLog(response.response);*/
    }






    // Animations and logic

    // suggestNewOneGame = (text = "") => {
    //     window.loft.showModal(
    //         <div>
    //             <Button action={() => this.clearPlayerInfoAfterGameOver()} href="" value={Lang("noText")} />
    //             <Button action={() => this.startNewSearch()} href="" value={Lang("yesText")} />
    //         </div>,
    //         text + "<br />" + Lang("findAnewGame")
    //     );
    // }


    quitGameConfirmer = (onconfirm = () => { }) => {
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
                            action={() => { this.quit(); onconfirm(); }}
                            href=""
                            value={Lang("quitTheGame")}
                            theme="neon"
                            strong="light"
                        />
                    </div>
                </div>
            </div>,
            Lang("attention")
        );
    }

    rampage = (hops, word = "", returnObj = false) => {
        clearTimeout(this.state.rampageTO);
        let newstate = {
            rampageCode: <Rampage hops={hops} word={word} />,
            rampageTO: setTimeout(() => {
                this.setStateUpdate({ rampageCode: "", rampageTO: null });
            }, 3000)
        };
        if (returnObj) return newstate;
        this.setStateUpdate(newstate);
    }

    sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    doStep = (koordsto, koordsfrom = this.state.selectedChecker, newPlayersStep = false, write = true, botstep = false) => {
        if (write) {
            if (window.loft.config.WriteSteps || this.state.online) this.saveStepResults(koordsto, koordsfrom, botstep);
        }

        if (window.loft.usersettings.animation === '0') {
            this.theStep(koordsto, koordsfrom, newPlayersStep);
        } else {
            this.stepAnimation(koordsto, koordsfrom, newPlayersStep);
        }
    }

    theStep = (koordsto, koordsfrom = this.state.selectedChecker, newPlayersStep = false) => {
        let { playerInfo, opponentInfo, bestMove, cells, game_status } = this.state;
        let { color } = cells[koordsfrom];
        let hops = cells[koordsfrom].possibilities[koordsto].path.length;

        if (React.isset(cells[koordsfrom].possibilities[koordsto].kills)) {
            cells[koordsfrom].possibilities[koordsto].kills.forEach((k, v) => {
                cells[k].checker = false;
                cells[k].color = false;
                cells[k].selectedChecker = false;
                cells[k].damka = false;
            });
        }

        // if (bestMove === null || bestMove.hops < hops || bestMove.effectivity < cells[koordsfrom].possibilities[koordsto].effectivity) {
        //     bestMove = {
        //         mask: this.getDeskMask(this.state.cells, true),
        //         from: koordsfrom,
        //         to: koordsto,
        //         hops: hops,
        //         path: cells[koordsfrom].possibilities[koordsto].path,
        //         effectivity: cells[koordsfrom].possibilities[koordsto].effectivity
        //     };
        // }

        cells[koordsto].checker = cells[koordsfrom].checker;
        cells[koordsto].color = cells[koordsfrom].color;
        cells[koordsto].damka = cells[koordsfrom].possibilities[koordsto].damka;

        cells[koordsfrom].checker = false;
        cells[koordsfrom].color = false;
        cells[koordsfrom].selectedChecker = false;
        cells[koordsfrom].damka = false;

        //Regenerate possible steps for all checkers
        cells = this.regeneratePossibilities(cells);

        let doneStat = this.countDoneCheckers(cells);

        for (let d in doneStat[this.state.playerInfo.color]) playerInfo[d] = doneStat[this.state.playerInfo.color][d];
        for (let d in doneStat[this.state.opponentInfo.color]) opponentInfo[d] = doneStat[this.state.opponentInfo.color][d];

        let consoleText = newPlayersStep ? Lang("yourTurnText") : Lang("enemyTurnText");
        if (playerInfo.done === 12 || opponentInfo.done === 12) consoleText = Lang("gameOverText");

        let playstage = 1;
        if (playstage < 2) {
            playstage += 0.2;
        } else {
            if (playerInfo.done > 9 || opponentInfo.done > 9) playstage = 3;
        }

        if (!window.loft.AjaxAvailable && (playerInfo.done > 10 || opponentInfo.done > 10 || playerInfo.possibilities === 0 || opponentInfo.possibilities === 0)) {
            let o = this.checkOfflineGameStatus(playerInfo, opponentInfo);
            if (o !== false) {
                playerInfo = o.playerInfo;
                opponentInfo = o.opponentInfo;
                game_status = o.game_status
            }
        }

        let newstate = {}
        if (hops > 2) newstate = this.rampage(hops, "", true);
        Noise(hops);

        newstate.playerInfo = playerInfo;
        newstate.opponentInfo = opponentInfo;
        newstate.bestMove = bestMove;
        newstate.playersStep = newPlayersStep;
        newstate.playstage = playstage;
        newstate.consoleText = consoleText;
        newstate.selectedChecker = false;
        newstate.cells = cells;
        newstate.game_status = game_status;

        this.setStateUpdate(newstate);

        setTimeout(() => this.botStep(color), 300);
    }

    getDeskMask = (cells = this.state.cells, colors = false) => {
        let mask = "";
        for (let y = 1; y < 9; y++) {
            for (let x = 1; x < 9; x++) {
                let k = x + ":" + y;
                if (colors) mask += cells[k].color === false ? "_" : cells[k].color;
                else mask += cells[k].color === false ? 0 : 1;
            }
        }
        return mask;
    }

    botStep = (lastStepColor) => {
        let color = this.state.autochess ? (lastStepColor === 1 ? 0 : 1) : (this.state.playerInfo.color === 1 ? 0 : 1);

        let gamestatuschecked = ((lastStepColor === this.state.playerInfo.color && this.state.playerInfo.status === window.loft.constants.STATUS_IN_GAME) || (lastStepColor === this.state.opponentInfo.color && this.state.opponentInfo.status === window.loft.constants.STATUS_IN_GAME));

        if ((this.state.playersStep === false || this.state.autochess) && this.state.online === false && gamestatuschecked && window.loft.usersettings.mode === "bot") {
            setTimeout(() => {

                let rndBOOL = true;//3.5 - window.loft.usersettings.difficulty < Math.random() * 3;

                if (rndBOOL && window.loft.AjaxAvailable && !this.state.autochess) {
                    if (this.state.botStepBuffer && React.isset(this.state.botStepBuffer.from)) {
                        this.doStep(this.state.botStepBuffer.to, this.state.botStepBuffer.from, true, true, true);
                        this.setStateUpdate({ botStepBuffer: null });
                    } else if (this.state.botStepBuffer === null) {
                        this.iiStep(color);
                    } else {
                        this.getBotStep(color);
                    }
                } else {
                    this.iiStep(color);
                }

            }, this.state.botspeed * 500 * Math.random());
        }
    }

    oneAnimatedStep = async (stepper, checker, possibility, index, t, koordsfrom, koordsto, lastStepColor, newPlayersStep, cells) => {

        stepper.style.transition = t + "ms transform ease-in";

        let k1 = possibility.path[index - 1];
        let k2 = possibility.path[index];
        let hops = possibility.path.length;

        let ooo = document.querySelector(`.ucell[koords="${k1}"]`);

        let x1 = ooo.offsetLeft;
        let y1 = ooo.offsetTop;

        ooo = document.querySelector(`.ucell[koords="${k2}"]>.empty`);

        let x2 = ooo.offsetLeft;
        let y2 = ooo.offsetTop;

        let dx = x1 - (x1 - x2) / 2;
        let dy = y1 - (y1 - y2) / 2;

        if (index === hops - 1 && hops > window.loft.config.EpicStepNum[window.loft.usersettings.game] && Math.random() > 0.5 && !cells[koordsfrom].damka) {

            if (hops > window.loft.config.EpicStepNum[window.loft.usersettings.game] + 2 || Math.random() > 0.5) {
                Noise("epic-rock");
            } else {
                Noise("epic");
            }
            stepper.style.transform = `translate(${ooo.offsetLeft}px, ${ooo.offsetTop}px) scale(1.5)`;
            stepper.className = stepper.className.replace(" animated", "") + " animated";

            await this.sleep(1200);

            stepper.style.transform = `translate(${ooo.offsetLeft}px, ${ooo.offsetTop}px) scale(1)`;
            stepper.className = stepper.className.replace(" animated", "");

            await this.sleep(5);
            stepper.style.display = "none";
            stepper.style.transition = "none";
            checker.style.opacity = 1;

            this.theStep(koordsto, koordsfrom, newPlayersStep);

            let ant1 = this.state.playerInfo.color === 0 ? "animate__revbounce" : "animate__bounce";
            let ant2 = this.state.playerInfo.color === 0 ? "animate__revshakeX" : "animate__shakeX";

            let k = document.querySelectorAll(".uchecker");
            for (let n = 0; n < k.length; n++) {
                if (k[n].id !== "stepper" && k[n].id !== "checker" + cells[koordsto].checker) {
                    k[n].className += ` ${ant1} animate__animated`;
                }
            }
            let u = document.querySelectorAll(`#ufield, #checker${cells[koordsto].checker}`);
            for (let n = 0; n < k.length; n++) {
                if (!React.isset(u[n])) continue;
                u[n].className += ` ${ant2} animate__animated`;
            }

            await this.sleep(1000);

            for (let n = 0; n < k.length; n++) {
                if (k[n].id !== "stepper" && k[n].id !== "checker" + cells[koordsto].checker) {
                    k[n].className = k[n].className.replace(` ${ant1}`, "").replace(" animate__animated", "");
                }
            }
            for (let n = 0; n < k.length; n++) {
                if (!React.isset(u[n])) continue;
                u[n].className = u[n].className.replace(` ${ant2}`, "").replace(" animate__animated", "");
            }

            return; // end of epic last step
        }

        stepper.style.transform = `translate(${dx}px, ${dy}px) scale(1.5)`;
        await this.sleep(t)
        stepper.style.transition = t + "ms transform ease-out";
        stepper.style.transform = `translate(${ooo.offsetLeft}px, ${ooo.offsetTop}px) scale(1)`
        await this.sleep(t);

        if (index === hops - 1) {
            stepper.style.display = "none";
            stepper.style.transition = "none";
            checker.style.opacity = 1;
            this.theStep(koordsto, koordsfrom, newPlayersStep);
            return; // end of default last step
        }

        Noise("soft");

        index++;

        if (React.isset(possibility.path[index])) {
            t = Math.pifagor(cells[possibility.path[index - 1]], cells[possibility.path[index]]) * (this.state.animationSpeed - (possibility.len * 2));

            setTimeout(async () => {
                this.oneAnimatedStep(stepper, checker, possibility, index, t, koordsfrom, koordsto, lastStepColor, newPlayersStep, cells);
            }, t * 2);
        }
    }

    stepAnimation = (koordsto, koordsfrom = this.state.selectedChecker, newPlayersStep = false, p = false) => {
        let { cells } = this.state;
        if (window.loft.usersettings.game === "corners" && cells[koordsfrom].possibilities[koordsto].path.length > 2) {
            cells[koordsfrom].possibilities[koordsto].path = cells[koordsfrom].possibilities[koordsto].path.filter((v, k) => k % 2 === 0);
        }
        let possibility = cells[koordsfrom].possibilities[koordsto];

        let stepper = document.getElementById("stepper");

        let checker = document.getElementById("checker" + cells[koordsfrom].checker);
        let lastStepColor = cells[koordsfrom].color;

        checker.style.opacity = 0;
        stepper.className = "uchecker color" + cells[koordsfrom].color + (cells[koordsfrom].damka ? " damka" : "");
        stepper.style.transform = `translate(${checker.offsetLeft}px, ${checker.offsetTop}px)`;
        stepper.style.display = "block";

        let index = 1;
        let t = Math.pifagor(cells[koordsfrom], cells[possibility.path[index]]) * (this.state.animationSpeed - (possibility.len * 2));

        setTimeout(async () => {
            this.oneAnimatedStep(stepper, checker, possibility, index, t, koordsfrom, koordsto, lastStepColor, newPlayersStep, cells);
            index++;
        }, t * 2);
    }

    consoleLog = (text) => {
        this.setStateUpdate({ consoleText: text });
    }

    clearPlayerInfoAfterGameOver = (state = {}, returner = false) => {
        let { playerInfo, opponentInfo } = this.state;
        playerInfo.status = window.loft.constants.STATUS_IN_GAME;
        playerInfo.color = 1;
        playerInfo.done = 0;
        playerInfo.possibilities = 0;
        opponentInfo.color = 0;
        opponentInfo.status = window.loft.constants.STATUS_IN_GAME;
        opponentInfo.color = 0;
        opponentInfo.done = 0;
        opponentInfo.possibilities = 10;

        state.playersStep = true;
        state.opponentInfo = opponentInfo;
        state.cells = this.dropCheckersToDefaults();
        state.playstage = 1;
        state.online = false;
        state.playerInfo = playerInfo;
        state.consoleText = Lang("disconnected") + ". " + Lang("yourTurnText");
        state.game_status = window.loft.constants.STATUS_ACTIVE;

        if (React.isset(window.loft.showModal)) window.loft.showModal(false);

        if (returner) return state;

        this.setStateUpdate(state);
    }

    showBestMove = () => {
        /*let {bestMove:b} = this.state;
        console.log("replay");
        console.log(b);
        if(b!==null && b.hops>3){
            setTimeout(()=>{
                let f = document.getElementById("fanfara");
                f.style.transition = "all 0.3s ease";
                f.style.opacity = "0.5";
                let cells = {};
                for(let i=0;i<b.mask.length;i++){
                    let x = (i%8)+1;
                    let y = Math.floor(i/8)+1;
                    let color = false;
                    let checker = false;
                    if(b.mask[i]==="0"){
                        color = 0;
                        checker = 0;
                    }
                    if(b.mask[i]==="1"){
                        color = 1;
                        checker = 1;
                    }
                    cells[x+":"+y] = {x:x,y:y,k:i+1,checker:checker,color:color};
                }
                this.setStateUpdate({cells:cells});
                setTimeout(()=>{
                    this.stepAnimation(b.to,b.from,false,b.path);
                },200);
            },1000);
        }*/
    }

    setStateUpdate = (o) => { // method just for debug
        // console.log("Changing state", o);
        this.setState(o);
    }


    deepCopy = (o) => {
        let t = {};
        for (let k in o) t[k] = typeof (o[k]) !== "object" ? o[k] : this.deepCopy(o[k]);
        return t;
    }

    deepArrCopy = (o) => {
        let t = [];
        for (let k in o) t[k] = o[k];
        return t;
    }

    // Main user action

    onCheckerClick = (koords) => {
        this.clicks++;
        if (this.clicks === 1) {
            this.timer = setTimeout( () => {
                this.clicks = 0;
            }, this.delay);
        } else {
            return; // dodge multiclicks
        }     

        let { cells } = this.state;

        if (React.isset(cells[koords]) && this.state.playersStep && this.state.playerInfo.status === window.loft.constants.STATUS_IN_GAME) {
            //Cell exists and it is a players turn to do a step
            if (cells[koords].color !== this.state.opponentInfo.color) {
                //If checker is player`s one or empty cell
                if (cells[koords].checker !== false) {
                    //New checker click
                    let newselectedChecker = false;
                    if (cells[koords].color === this.state.playerInfo.color && this.state.selectedChecker !== koords) {
                        newselectedChecker = koords;
                    }
                    Noise("checker-take");
                    this.setStateUpdate({ selectedChecker: newselectedChecker });
                } else {
                    //Trying to do a step
                    if (this.state.selectedChecker !== false) {
                        //If we have an active checker
                        if (React.isset(cells[this.state.selectedChecker].possibilities[koords])) {
                            //If we have such step as possible
                            this.doStep(koords);
                            if (this.state.online) {
                                let param = {
                                    action: "THESTEP",
                                    from: this.state.selectedChecker,
                                    to: koords,
                                    hops: cells[this.state.selectedChecker].possibilities[koords].path.length,
                                    checker: cells[this.state.selectedChecker].checker,
                                    effectivity: cells[this.state.selectedChecker].possibilities[koords].effectivity
                                };
                                if (this.state.playerInfo.done > 9) param.checkdone = 1;
                                if (this.state.socketOpened) this.socketSend(param);
                            }/*else{
                                this.doStep(koords);
                            }*/
                        } else {
                            //Unable to go there
                            //cells[this.state.selectedChecker].active = false;

                            let needToEatMore = false;
                            if (window.loft.isCheckers) {
                                for (let p in cells[this.state.selectedChecker].possibilities) {
                                    let pos = cells[this.state.selectedChecker].possibilities[p];
                                    if (pos.path.indexOf(koords) > 0 && pos.path.indexOf(koords) < pos.path.length - 1) {
                                        needToEatMore = { kills: pos.kills, more: true };
                                        break;
                                    }
                                }
                                if (!needToEatMore) {
                                    for (let c in cells) {
                                        if (cells[c].color !== cells[this.state.selectedChecker].color) continue;
                                        for (let p in cells[c].possibilities) {
                                            let pos = cells[c].possibilities[p];
                                            if (pos.kills.length > 0) {
                                                needToEatMore = { kills: pos.kills, more: false };
                                                break;
                                            }
                                        }
                                    }
                                }
                            }

                            if (needToEatMore) {
                                Noise("warning");
                                if (window.cordova) navigator.vibrate(200);
                                if (needToEatMore.more) this.consoleLog(Lang("youHaveToTakeMore"));
                                else this.consoleLog(Lang("youHaveToTake"));
                                for (let k in needToEatMore.kills) {
                                    let ch = document.querySelector(`.ucell[koords='${needToEatMore.kills[k]}'] .uchecker`);
                                    ch.className = `${ch.className} deadly`;
                                }
                            } else {
                                this.consoleLog(Lang("stepIsImpossible"));
                            }

                        }
                    }
                }
            }
        }
    }

    // Render

    render() {
        let renderedField = '';
        if (Object.keys(this.state.cells).length > 0) {
            renderedField = Object.keys(this.state.cells).map((koords) => {
                let { x, y, k, color, checker, possibilities } = this.state.cells[koords];
                let damka = (((color === 0 && y === 8) || (color === 1 && y === 1) || this.state.cells[koords].damka) && window.loft.isCheckers);
                let active = koords === this.state.selectedChecker;
                return (<Cell onCheckerClick={this.onCheckerClick} x={x} y={y} key={k} k={k} checker={checker} damka={damka} color={color} active={active} variable={possibilities} />);
            });
        }

        let fieldClass = "";
        if (this.state.playerInfo.color === 0) fieldClass = "forBlacks";

        return (
            <div className="ucon">
                <AppHeader
                    /*playerName={this.state.playerInfo.display_name}
                    playerColor={this.state.playerInfo.color}
                    playerStatus={this.state.playerInfo.status}
                    playerStat={window.loft.isGuest ? {} : this.state.playerInfo.stat}*/
                    playerInfo={this.state.playerInfo}
                    searching={this.state.searchingOnlineOpponent}
                    count={this.state.searchingOnlineCounter}
                    online={this.state.online}
                    startNewSearch={this.startNewSearch}
                    stopTheSearch={this.stopTheSearch}
                    quitGameConfirmer={this.quitGameConfirmer}
                    updateSetting={this.updateSetting}
                    setAppState={this.props.setAppState}
                    quit={this.quit}
                />
                <div className="umaincon animate__fadeInRight animate__animated">
                    <div className={fieldClass} id="ufield">
                        <div className="ufcn">
                            <div className="uchecker color0" id="stepper">&nbsp;</div>
                            {renderedField}
                        </div>
                        <Fanfara
                            playerInfo={this.state.playerInfo}
                            opponentInfo={this.state.opponentInfo}
                            // continueWithSameOpponent={this.continueWithSameOpponent}
                            // searchNewOpponent={this.searchNewOpponent}
                            newGame={this.initiation}
                            quit={this.quit}
                            rampage={this.rampage}
                            // showBestMove={this.showBestMove}
                            game_id={this.state.game_id}
                            game_status={this.state.game_status}
                        />
                    </div>
                    <Console
                        text={this.state.consoleText}
                        online={this.state.online}
                        rampageCode={this.state.rampageCode}
                        player={this.state.playerInfo.user.display_name}
                        opponent={this.state.opponentInfo.user.display_name}
                        searching={this.state.searchingOnlineOpponent}
                        count={this.state.searchingOnlineCounter}
                        timeoutCounter={this.state.timeoutCounter}
                    />
                </div>
            </div>
        );
    }
}
