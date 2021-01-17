import React from 'react';

import AppHeader from '../AppHeader/';
import Cell from '../Cell/';
import Console from '../Console/';
import Fanfara from '../Fanfaras';
import Rampage from '../Rampage';
import Button from '../Button';
import Lang from '../../Funcs/Lang';
import postData from '../../Funcs/PostDataFuncs';
import Noise from '../../Funcs/Noise';

import './app.css';

export default class App extends React.Component{

    INT = 0;

    STATUS_IN_GAME    = 0;
    STATUS_DONE       = 5;
    STATUS_FAIL       = 6;
    STATUS_WON        = 7;
    STATUS_DRAW       = 8;

    state = {
        /* USERS DYNAMIC INFO */
        cells: {},
        bestMove: null,
        playerInfo: {
            user: {
                display_name: "player" + Math.round(Math.random() * 1000 + 1000), 
                username: false,
            },
            status: window.loft.constants.STATUS_IN_GAME,
            color: "white",
            hops: 0,
            steps: 0,
            cells: 12,
            done: 0,
            possibilities: 10,
            stat: {
                total_games:    0,
                total_wins:     0,
                total_failes:   0, 
                total_draws:    0,
                total_steps:    0,
                total_hops:     0,
                experience:     0,
                level:          1,
            }
        },
        opponentInfo: {
            user: {
                display_name: "bot" + Math.round(Math.random() * 1000 + 1000), 
                username: false,
            },
            status: window.loft.constants.STATUS_IN_GAME,
            color: "black",
            hops: 0,
            steps: 0,
            cells: 12,
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
        gameTotalStat: {
            TWD: 0, TBD: 0, TC: 24, MC: 0
        },
        rampageCode: "",
        rampageTO: null,
        targetCells: {}, 
        searchingOnlineOpponent: false,
        searchingOnlineCounter: 0,
        timeoutCheckInterval: false,
        
        /* DEV FIELDS */
        debug: window.loft.config.Debug,
        autochess: false,
        writesteps: window.loft.config.WriteSteps,
        writestats: window.loft.config.WriteStats,
        gtoken: "",
    };

    componentDidMount() {
        console.log(window.loft);
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
        this.initiation({});

        if (window.loft.usersettings.mode === "online") this.startNewSearch();
    }

    initiation = (state) => {
        let {playerInfo, opponentInfo} = this.state;
        
        if(!window.loft.isGuest){
            playerInfo.user.display_name = window.loft.user_info.display_name;
            playerInfo.user.username = window.loft.user_info.username;
            playerInfo.stat = window.loft.user_info.stat;
        }

        if(this.state.autochess) playerInfo.user.display_name = "bot" + Math.round(Math.random() * 1000 + 1000);

        state.playerInfo = playerInfo;

        if (window.loft.usersettings.mode === "bot") {
            if (Math.random() > 0.5) {
                state.playerInfo.color = "white";
                opponentInfo.color = "black";
            } else {
                state.playerInfo.color = "black";
                opponentInfo.color = "white";
            }
            state.opponentInfo = opponentInfo;
            state.playersStep = state.playerInfo.color === "white";
        }

        state.targetCells = this.setTargetCells();

        state.cells = this.dropCheckersToDefaults(state.debug);
        
        this.setMazafuckinState(state);
        
        if(this.state.autochess || !state.playersStep) setTimeout(() => this.botStep("black"), 300);
    }






    // Working with server

    // Main wrap

    act = (o = {}) => {
        if (window.loft.SocketAvailable) {
            console.log("socket!");
        } else if (window.loft.AjaxAvailable) {
            postData({
                url: window.loft.apiserver + o.action + (typeof(o.id) !== "undefined" ? `/${o.id}` : ""),
                data: o.data,
                success: o.success
            });
        }
    }

    checkFor = (target = "check-search") => {
        if (window.loft.SocketAvailable) {
            console.log("socket!");
        } else {
            clearInterval(this.INT);
            this.INT = setInterval(() => {
                this.setState({
                    searchingOnlineOpponent: true,
                    searchingOnlineCounter: this.state.searchingOnlineCounter + 1,
                });
                if (this.state.searchingOnlineCounter % 4 === 0) {
                    postData({
                        url: window.loft.apiserver + target,
                        success: (res) => {
                            if (res.success && res.game) {
                                clearInterval(this.INT);
                                this.startGame(res.game);
                                this.setState({
                                    searchingOnlineOpponent: false,
                                    searchingOnlineCounter: 0,
                                });
                            }
                        }
                    });
                }
            }, 1000)
        }
    }

    // Funcs

    startNewSearch = () => {
        this.act({
            action: 'search/' + window.loft.usersettings.game,
            success: (res) => {
                if (res.success && res.game) {
                    this.startGame(res.game);
                } else {
                    this.checkFor("check-search");
                }
                window.loft.showModal(false);
            }
        });
    }

    stopTheSearch = () => {
        this.setState({
            searchingOnlineOpponent: false,
            searchingOnlineCounter: 0,
        });
        this.act({
            action: 'stop-search',
            success: () => {
                clearInterval(this.INT);
            }
        });
    }

    quit = () => {
        this.clearPlayerInfoAfterGameOver();
        this.act({
            action: 'quit'
        });
    }

    startGame = (game) => {
        let playersStep = game.players["player"].color === "white";
        let newStateObject = {
            playersStep: playersStep,
            opponentInfo: game.players["opponent"],
            playerInfo: game.players["player"],
            lastStepTime: game.lastStepTime,
            consoleText: (playersStep ? Lang("yourTurnText") : Lang("enemyTurnText")),
            online: true,
            cells: this.dropCheckersToDefaults(),
            searchingOnlineOpponent: false,
            searchingOnlineCounter: 0,
            gtoken: game.gtoken,
            timeoutCheckInterval: setInterval(()=>{
                if(this.state.online && this.state.playerInfo.status === window.loft.constants.STATUS_IN_GAME && this.state.lastStepTime>0){
                    let r = Math.floor(new Date().getTime() / 1000) - this.state.lastStepTime;
                    if (!this.state.playersStep && !window.loft.SocketAvailable && r%5===0) {
                        this.checkStep("check-step");
                    }
                    if (this.state.playersStep && !window.loft.SocketAvailable && r%10===0) {
                        this.checkStep("game-status");
                    }
                    if (window.loft.SocketAvailable) {
                        this.checkTOI();
                    }
                }
            },1000)
        }
        this.setMazafuckinState(newStateObject);
    }

    checkTOI = () => {
        let r = Math.floor(new Date().getTime() / 1000) - this.state.lastStepTime;
        
        if(r > window.loft.config.StepTimeLimit * 2 / 3){
            this.consoleLog((this.state.playersStep ? Lang("yourTurnText") : Lang("enemyTurnText"))+(window.loft.config.StepTimeLimit - r));
        }
        if(r > window.loft.config.StepTimeLimit){
            if(!this.state.playersStep){
                //this.socketSend({action:"TIMEOUTOPPO"}); // one more check on server side by socket
                this.suggestNewOneGame(Lang("enemyLostByTimeout"));
            }
            this.consoleLog(Lang("gameOverByTimeout"));
            clearInterval(this.state.timeoutCheckInterval);
        }
    }

    checkStep = (action) => {
        this.act({
            action: action,
            data: {gtoken: this.state.gtoken},
            success: (res) => {
                if (res.success){
                    this.procedureStepData(res);
                } else {
                    console.log(res);
                }
                this.checkTOI();
            }
        });
    }

    procedureStepData = (stepData) => {
        if (typeof(stepData.game_results) !== "undefined") {
            console.log(stepData.game_results, window.loft.constants);
            if (stepData.game_results.status === window.loft.constants.STATUS_NOMANS) {
                let {playerInfo, opponentInfo} = this.state;
                playerInfo.status = window.loft.constants.STATUS_DRAW;
                opponentInfo.status = window.loft.constants.STATUS_DRAW;
                this.setState({ playerInfo: playerInfo, opponentInfo: opponentInfo });
                clearInterval(this.state.timeoutCheckInterval);
            } else if (stepData.game_results.status === window.loft.constants.STATUS_FINISHED) {
                let {playerInfo, opponentInfo} = this.state;
                if (typeof(stepData.game_results.winner) !== "undefined") {
                    playerInfo.status = window.loft.constants.STATUS_WON;
                    opponentInfo.status = window.loft.constants.STATUS_FAIL;
                } else if (typeof(stepData.game_results.looser) !== "undefined") {
                    playerInfo.status = window.loft.constants.STATUS_FAIL;
                    opponentInfo.status = window.loft.constants.STATUS_WON;
                }
                this.setState({ playerInfo: playerInfo, opponentInfo: opponentInfo });
                clearInterval(this.state.timeoutCheckInterval);
            }
            return;
        }
        if (typeof(stepData.lastStep) !== "undefined") {
            this.setState({
                lastStepTime: stepData.lastStep.timestamp,
            });
            this.doStep(
                stepData.lastStep.to,
                stepData.lastStep.from,
                stepData.lastStep.color !== (this.state.playerInfo.color === "white" ? 1 : 0),
                null,
                false
            );
            return;
        }
    }

    getBotStep = (color) => {
        this.act({
            action: 'get-bot-step',
            data: {
                playstage: this.state.debug ? 3 : this.state.playstage,
                mask: this.getDeskMask(),
                color: color
            },
            success: (res) => {
                if(!res.success){
                    this.iiStep(color);
                }else{
                    if(this.state.cells[res.data.from].color===color && typeof(this.state.cells[res.data.from].possibilities[res.data.to])!=="undefined"){
                        this.doStep(res.data.to, res.data.from, true, null);
                    }else{
                        this.iiStep(color);
                    }
                }
            }
        });
    }

    saveStepResults = (koordsto, koordsfrom, pflag) => {
        let {cells} = this.state;
        this.act({
            action: 'set-step',
            data: {
                mask:   this.getDeskMask(),
                from:   koordsfrom,
                to:     koordsto,
                kills:  cells[koordsfrom].possibilities[koordsto].kills ?? [],
                effectivity: cells[koordsfrom].possibilities[koordsto].effectivity,
                ep:     this.state.opponentInfo.possibilities,
                gtoken: this.state.gtoken,
            },
            success: (res)=>{
                if(res.success){
                    // nothing to do here
                }
            }
        });
    }

    








    // Animations and logic

    suggestNewOneGame = (text = "") => {
        window.loft.showModal(
            <div>
                <Button action={()=>this.clearPlayerInfoAfterGameOver()} href="" value={Lang("noText")} />
                <Button action={()=>this.startNewSearch()} href="" value={Lang("yesText")} />
            </div>,
            text + "<br />" + Lang("findAnewGame")
        );
    }


    quitGameConfirmer = (onconfirm = () => {}) => {
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

    rampage = (hops, word="", returnObj=false) => {
        clearTimeout(this.state.rampageTO);
        let newstate = {
            rampageCode:<Rampage hops={hops} word={word} />,
            rampageTO:setTimeout(()=>{
                this.setMazafuckinState({rampageCode:"",rampageTO:null});
            },3000)
        };
        if (returnObj) return newstate;
        this.setMazafuckinState(newstate);
    }

    sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    doStep = (koordsto, koordsfrom = this.state.selectedChecker, newPlayersStep = false, pflag = true, write = true) => {
        if (write) if(this.state.writesteps || this.state.online) this.saveStepResults(koordsto,koordsfrom,pflag);
        
        if(window.loft.usersettings.animation==='0'){
            this.theStep(koordsto,koordsfrom,newPlayersStep);
        }else{
            this.stepAnimation(koordsto,koordsfrom,newPlayersStep);
        }
    }

    theStep = (koordsto,koordsfrom=this.state.selectedChecker,newPlayersStep=false) => {
        let {playerInfo,opponentInfo,bestMove,cells, gameTotalStat} = this.state;
        let {color} = cells[koordsfrom];
        let hops = cells[koordsfrom].possibilities[koordsto].path.length;

        if (typeof(cells[koordsfrom].possibilities[koordsto].kills) !== "undefined") {
            cells[koordsfrom].possibilities[koordsto].kills.forEach((k, v) => {
                cells[k].checker = false;
                cells[k].color = false;
                cells[k].selectedChecker = false;
                cells[k].damka = false;
            });
        }
        
        if(bestMove===null || bestMove.hops<hops || bestMove.effectivity < cells[koordsfrom].possibilities[koordsto].effectivity){
            bestMove = {
                mask: this.getDeskMask(this.state.cells,true),
                from:koordsfrom,
                to:koordsto,
                hops:hops,
                path:cells[koordsfrom].possibilities[koordsto].path,
                effectivity:cells[koordsfrom].possibilities[koordsto].effectivity
            };
        }
        if(cells[koordsfrom].color === playerInfo.color){
            playerInfo.hops += hops;
            playerInfo.steps++;
        }else{
            opponentInfo.hops += hops;
            opponentInfo.steps++;
        }
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
        if(playerInfo.done === 12 || opponentInfo.done === 12) consoleText = Lang("gameOverText");

        let playstage = 1;
        if(playerInfo.steps + opponentInfo.steps > 4){
            playstage = 2;
            if(playerInfo.done > 9 || opponentInfo.done > 9) playstage = 3;
        }

        if(this.state.online===false && (playerInfo.done>10 || opponentInfo.done>10)){
            let o = this.checkOfflineGameStatus(playerInfo,opponentInfo);
            if(o!==false){
                playerInfo = o.playerInfo;
                opponentInfo = o.opponentInfo;
            }
        }
        if (window.loft.isCheckers) {
            let totalWhiteDamkas = document.querySelectorAll(`.ucell .uchecker.white.damka`).length;
            let totalBlackDamkas = document.querySelectorAll(`.ucell .uchecker.black.damka`).length;
            let totalCheckers = document.querySelectorAll(`.ucell .uchecker.black,.ucell .uchecker.white`).length;
            if (totalWhiteDamkas || totalBlackDamkas) {
                if (totalWhiteDamkas > gameTotalStat.TWD || totalBlackDamkas > gameTotalStat.TBD || totalCheckers < gameTotalStat.TC) {
                    gameTotalStat = {
                        TWD: totalWhiteDamkas, TBD: totalBlackDamkas, TC: totalCheckers, MC: 0
                    }
                }
                if (totalWhiteDamkas === gameTotalStat.TWD && totalBlackDamkas === gameTotalStat.TBD && totalCheckers === gameTotalStat.TC) {
                    gameTotalStat.MC++;
                    if (gameTotalStat.MC === 15) {
                        playerInfo.status = window.loft.constants.STATUS_DONE;
                        opponentInfo.status = window.loft.constants.STATUS_DONE;
                    }
                }
            }
        }
        let newstate = {}
        if(hops>2) newstate = this.rampage(hops, "", true);
        Noise(hops);

        newstate.playerInfo = playerInfo;
        newstate.opponentInfo = opponentInfo;
        newstate.bestMove = bestMove;
        newstate.playersStep = newPlayersStep;
        newstate.playstage = playstage;
        newstate.consoleText =  consoleText;
        newstate.selectedChecker =  false;
        newstate.cells = cells;
        newstate.gameTotalStat = gameTotalStat;  

        this.setMazafuckinState(newstate);

        setTimeout(() => this.botStep(color), 300);
    }

    getDeskMask = (cells = this.state.cells, colors=false) => {
        let mask = "";
        for(let y=1;y<9;y++){
            for(let x=1;x<9;x++){
                let k = x+":"+y;
                if(colors) mask += cells[k].color===false ? "_":(cells[k].color==="black"?"0" : "1");
                else mask += cells[k].color===false ? "0" : "1";
            }
        }
        return mask;
    }

    botStep = (lastStepColor) => {
        let color = this.state.autochess?(lastStepColor==="white"?"black":"white"):(this.state.playerInfo.color==="white"?"black":"white");

        let gamestatuschecked = ((lastStepColor === this.state.playerInfo.color && this.state.playerInfo.status === window.loft.constants.STATUS_IN_GAME) || (lastStepColor === this.state.opponentInfo.color && this.state.opponentInfo.status === window.loft.constants.STATUS_IN_GAME));
        
        if((this.state.playersStep===false || this.state.autochess) && this.state.online===false && gamestatuschecked && window.loft.usersettings.mode === "bot"){
            setTimeout(()=>{

                if(window.loft.AjaxAvailable && !this.state.autochess){
                    this.getBotStep(color);
                }else{
                    this.iiStep(color);
                }

            },this.state.botspeed * 1000 * Math.random());
        }
    }

    oneAnimatedStep = async (stepper, checker, possibility, index, t, koordsfrom, koordsto, lastStepColor, newPlayersStep, cells) => {
        
        stepper.style.transition = t+"ms transform ease-in";

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

        if (index === hops - 1 && hops > window.loft.config.EpicStepNum && Math.random() > 0.5 && !cells[koordsfrom].damka) {
            
            if (hops > window.loft.config.EpicStepNum + 2 || Math.random() > 0.5) {
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

            this.theStep(koordsto,koordsfrom,newPlayersStep);

            let ant1 = this.state.playerInfo.color === "black" ? "animate__revbounce" : "animate__bounce";
            let ant2 = this.state.playerInfo.color === "black" ? "animate__revshakeX" : "animate__shakeX";

            let k = document.querySelectorAll(".uchecker");
            for( let n = 0; n < k.length; n++) {
                if (k[n].id !== "stepper" && k[n].id !== cells[koordsto].checker) {
                    k[n].className += ` ${ant1} animate__animated`;
                }
            }
            let u = document.querySelectorAll(`#ufield, #${cells[koordsto].checker}`);
            for( let n = 0; n < k.length; n++) {
                if (typeof(u[n]) === "undefined") continue;
                u[n].className += ` ${ant2} animate__animated`;
            }

            await this.sleep(1000);

            for( let n = 0; n < k.length; n++) {
                if (k[n].id !== "stepper" && k[n].id !== cells[koordsto].checker) {
                    k[n].className = k[n].className.replace(` ${ant1}`, "").replace(" animate__animated", "");
                }
            }
            for( let n = 0; n < k.length; n++) {
                if (typeof(u[n]) === "undefined") continue;
                u[n].className = u[n].className.replace(` ${ant2}`, "").replace(" animate__animated", "");
            }

            return; // end of epic last step
        }

        stepper.style.transform = `translate(${dx}px, ${dy}px) scale(1.5)`;
        await this.sleep(t)
        stepper.style.transition = t+"ms transform ease-out";
        stepper.style.transform = `translate(${ooo.offsetLeft}px, ${ooo.offsetTop}px) scale(1)`
        await this.sleep(t);

        if (index === hops - 1) {
            stepper.style.display = "none";
            stepper.style.transition = "none";
            checker.style.opacity = 1;
            this.theStep(koordsto,koordsfrom,newPlayersStep);
            return; // end of default last step
        } 

        Noise("soft");

        index++;

        if (typeof(possibility.path[index]) !== "undefined") {
            t = Math.pifagor(cells[possibility.path[index - 1]], cells[possibility.path[index]]) * (this.state.animationSpeed - (possibility.len * 2));
            
            setTimeout(async () => {
                this.oneAnimatedStep(stepper, checker, possibility, index, t, koordsfrom, koordsto, lastStepColor, newPlayersStep, cells);
            }, t*2);
        }
    }

    stepAnimation = (koordsto,koordsfrom=this.state.selectedChecker,newPlayersStep=false,p=false) => {
        let {cells} = this.state;
        if (window.loft.usersettings.game === "corners" && cells[koordsfrom].possibilities[koordsto].path.length > 2) {
            cells[koordsfrom].possibilities[koordsto].path = cells[koordsfrom].possibilities[koordsto].path.filter((v,k) => k%2===0);
        }
        let possibility = cells[koordsfrom].possibilities[koordsto];
        
        let stepper = document.getElementById("stepper");
        
        let checker = document.getElementById(cells[koordsfrom].checker);
        let lastStepColor = cells[koordsfrom].color;
        
        checker.style.opacity = 0;
        stepper.className = "uchecker " + cells[koordsfrom].color + (cells[koordsfrom].damka ? " damka" : "");
        stepper.style.transform = `translate(${checker.offsetLeft}px, ${checker.offsetTop}px)`;
        stepper.style.display = "block";

        let index = 1;
        let t = Math.pifagor(cells[koordsfrom], cells[possibility.path[index]]) * (this.state.animationSpeed - (possibility.len * 2));

        setTimeout(async () => {
            this.oneAnimatedStep(stepper, checker, possibility, index, t, koordsfrom, koordsto, lastStepColor, newPlayersStep, cells);
            index++;
        }, t*2);
    }

    consoleLog = (text) => {
        this.setMazafuckinState({consoleText: text});
    }

    clearPlayerInfoAfterGameOver = () => {
        let {playerInfo} = this.state;
        playerInfo.status = window.loft.constants.STATUS_IN_GAME;
        playerInfo.color = "white";
        playerInfo.hops = 0;
        playerInfo.steps = 0;
        playerInfo.done = 0;
        playerInfo.possibilities = 0;

        this.setMazafuckinState({
            playersStep: true,
            opponentInfo: {
                user: {
                    display_name: "bot" + Math.round(Math.random() * 1000 + 1000), 
                    username: false,
                },
                name: "bot"+Math.round(Math.random()*1000 + 1000), 
                status: window.loft.constants.STATUS_IN_GAME,
                color: "black",
                hops: 0,
                steps: 0,
                done: 0,
                possibilities: 10,
            },
            afkcounter: 0,
            cells: this.dropCheckersToDefaults(),
            playstage: 1,
            online: false,
            playerInfo: playerInfo,
            consoleText: Lang("disconnected") + ". " + Lang("yourTurnText")
        });
        window.loft.showModal(false);
    }

    updatePI = (data) => {
        let {playerInfo: pi} = this.state;
        for(let k in data){
            if(typeof(pi.statistics[k])!=="undefined") pi.statistics[k] = data[k];
        }
        this.setMazafuckinState({playerInfo: pi});
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
                        color = "black";
                        checker = "black";
                    }
                    if(b.mask[i]==="1"){
                        color = "white";
                        checker = "white";
                    }
                    cells[x+":"+y] = {x:x,y:y,k:i+1,checker:checker,color:color};
                }
                this.setMazafuckinState({cells:cells});
                setTimeout(()=>{
                    this.stepAnimation(b.to,b.from,false,b.path);
                },200);
            },1000);
        }*/
    }

    setMazafuckinState = (o) => { // method just for debug
        //console.log("Changing state",o); 
        this.setState(o);
    }
    

    deepCopy = (o) => {
        let t = {};
        for(let k in o) t[k] = typeof(o[k])!=="object" ? o[k] : this.deepCopy(o[k]);
        return t;
    }

    deepArrCopy = (o) => {
        let t = [];
        for(let k in o) t[k] = o[k];
        return t;
    }

    // Main user action

    onCheckerClick = (koords) => {
        let {cells} = this.state;
        if (typeof(cells[koords])!=="undefined" && this.state.playersStep && this.state.playerInfo.status===window.loft.constants.STATUS_IN_GAME)
        {
            //Cell exists and it is a players turn to do a step
            if (cells[koords].color !== this.state.opponentInfo.color) {
                //If checker is player`s one or empty cell
                if(cells[koords].checker !== false){
                    //New checker click
                    let newselectedChecker = false;
                    if(cells[koords].color === this.state.playerInfo.color && this.state.selectedChecker !== koords){
                        newselectedChecker = koords;
                    }
                    Noise("checker-take");
                    this.setMazafuckinState({selectedChecker: newselectedChecker});
                }else{
                    //Trying to do a step
                    if (this.state.selectedChecker !== false) {
                        //If we have an active checker
                        if(typeof(cells[this.state.selectedChecker].possibilities[koords]) !== "undefined"){
                            //If we have such step as possible
                            this.doStep(koords);
                            /*if (this.state.online) {
                                let param = {
                                    action:"THESTEP",
                                    from:this.state.selectedChecker,
                                    to:koords,
                                    hops: cells[this.state.selectedChecker].possibilities[koords].path.length,
                                    checker:cells[this.state.selectedChecker].checker,
                                    effectivity: cells[this.state.selectedChecker].possibilities[koords].effectivity
                                };
                                if(this.state.playerInfo.done>9) param.checkdone = 1;
                                //if(this.state.socketOpened) this.socketSend(param);
                            }else{
                                this.doStep(koords);
                            }*/
                        }else{
                            //Unable to go there
                            //cells[this.state.selectedChecker].active = false;
                            
                            let needToEatMore = false;
                            if (window.loft.isCheckers) {
                                for (let p in cells[this.state.selectedChecker].possibilities) {
                                    let pos = cells[this.state.selectedChecker].possibilities[p];
                                    if (pos.path.indexOf(koords) > 0 && pos.path.indexOf(koords) < pos.path.length - 1) {
                                        needToEatMore = {kills: pos.kills, more: true};
                                        break;
                                    }
                                }
                                if (!needToEatMore) {
                                    for (let c in cells) {
                                        if (cells[c].color !== cells[this.state.selectedChecker].color) continue;
                                        for (let p in cells[c].possibilities) {
                                            let pos = cells[c].possibilities[p];
                                            if (pos.kills.length > 0) {
                                                needToEatMore = {kills: pos.kills, more: false};
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            
                            if (needToEatMore) {
                                Noise("warning");
                                if (window.cordova) navigator.vibrate(200);
                                if (needToEatMore.more) this.consoleLog( Lang("youHaveToTakeMore") );
                                else this.consoleLog( Lang("youHaveToTake") );
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

    render(){
        let renderedField = '';
        if(Object.keys(this.state.cells).length > 0){
            renderedField = Object.keys(this.state.cells).map((koords) => {
                let {x,y,k,color,checker,possibilities} = this.state.cells[koords];
                let damka = (((color === "black" && y === 8) || (color === "white" && y === 1) || this.state.cells[koords].damka) && window.loft.isCheckers);
                let active = koords === this.state.selectedChecker;
                return (<Cell onCheckerClick={this.onCheckerClick} x={x} y={y} key={k} k={k} checker={checker} damka={damka} color={color} active={active} variable={possibilities} />);
            });
        }

        let fieldClass = "";
        if (this.state.playerInfo.color === "black") fieldClass = "forBlacks";

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
                        <div className="uchecker black" id="stepper">&nbsp;</div>
                        {renderedField}
                        </div>
                        <Fanfara
                            playerInfo={this.state.playerInfo} 
                            opponentInfo={this.state.opponentInfo} 
                            bestMove={this.state.bestMove}
                            continueWithSameOpponent={this.continueWithSameOpponent}
                            searchNewOpponent={this.searchNewOpponent}
                            quit={this.quit}
                            updatePI={this.updatePI}
                            rampage={this.rampage}
                            showBestMove={this.showBestMove}
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
                        rec={this.state.writesteps}
                    />
                </div>
        </div>
        );
    }
}
