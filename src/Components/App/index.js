import React from 'react';

import AppHeader from '../AppHeader/';
import Cell from '../Cell/';
import Console from '../Console/';
import Fanfara from '../Fanfaras';
import Rampage from '../Rampage';
import Lang from '../../Funcs/Lang';
import Button from '../Button';
import postData from '../../Funcs/PostDataFuncs';

import './app.css';
import Noise from '../../Funcs/Noise';
//import Server from '../../Funcs/Server';


export default class App extends React.Component{

    INT = 0;

    BLACK = 0;
    WHITE = 1;

    STATUS_IN_GAME    = 0;
    STATUS_DONE       = 5;
    STATUS_FAIL       = 6;
    STATUS_WON        = 7;
    STATUS_DRAW       = 8;

    state = {
        /* USERS DYNAMIC INFO */
        cells: {},
        bestMove: null,
        //server: new Server(),
        playerInfo: {
            display_name: "player"+Math.round(Math.random()*1000 + 1000), 
            username: false,
            status: "in_game",
            color: "white",
            signed: false,
            steps: 0,
            moves: 0,
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
            display_name: "bot"+Math.round(Math.random()*1000 + 1000), 
            username: false,
            status: "in_game",
            color: "black",
            steps: 0,
            moves: 0,
            cells: 12,
            done: 0,
            possibilities: 10,
        },
        game: window.location.href.split("/").pop(),
        /* TECH INFO */
        selectedChecker: false,
        playersStep: true,
        lastStep: "",
        lastStepTime: 0,
        animationSpeed: 45,
        online: false,
        socketOpened: false,
        botspeed: 1,
        epicstepnum: 2,
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
        AjaxAvailable: false,
        serverInfo: {
            avgwaittime: {cnt: 0, ttl: 0, avg: 0},
            playersstat: {total: 0, searching: 0, in_game: 0},
            steptimelimit: 30
        },
        
        /* DEV FIELDS */
        debug: window.loft.config.Debug,
        autochess: false,
        writesteps: window.loft.config.WriteSteps,
        writestats: window.loft.config.WriteStats,
        game_id: 0,
        gtoken: "",
    };

    componentDidMount() {
        console.log(window.loft);
        this.initiation({});
    }

    initiation = (state) => {
        let {playerInfo, opponentInfo} = this.state;
        
        if(!window.loft.isGuest){
            playerInfo.display_name = window.loft.user_info.display_name;
            playerInfo.username = window.loft.user_info.username;
            playerInfo.stat = window.loft.user_info.stat;
        }

        if(this.state.autochess) playerInfo.display_name = "bot"+Math.round(Math.random()*1000 + 1000);

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
                postData({
                    url: window.loft.apiserver + target,
                    success: (res) => {
                        if (res.success && res.game) {
                            clearInterval(this.INT);
                            this.startGame(res.game);
                        }
                    }
                });
            }, 3000)
        }
    }

    // Funcs

    startNewSearch = () => {
        this.act({
            action: 'search',
            success: (res) => {
                if (res.success && res.game) {
                    this.startGame(res.game);
                } else {
                    this.checkFor("check-search");
                }
            }
        });
    }

    stopTheSearch = () => {
        this.act({
            action: 'stop-search',
            success: () => {
                clearInterval(this.INT);
            }
        });
    }

    startGame = (game) => {
        let playersStep = game.players["player"].color = this.WHITE;
        let newStateObject = {
            playersStep: playersStep,
            opponentInfo: game.players["player"],
            playerInfo: game.players["opponent"],
            lastStepTime: game.started,
            consoleText: (playersStep ? Lang("yourTurnText") : Lang("enemyTurnText")),
            online: true,
            cells: this.dropCheckersToDefaults(),
            searchingOnlineOpponent: false,
            searchingOnlineCounter: 0,
            timeoutCheckInterval: setInterval(()=>{
                if(this.state.online && this.state.playerInfo.status === this.STATUS_IN_GAME && this.state.lastStepTime>0){
                    let r = Math.floor(new Date().getTime() / 1000) - this.state.lastStepTime;
                    if(r > window.loft.config.StepTimeLimit * 2 / 3){
                        this.consoleLog((this.state.playersStep ? Lang("yourTurnText") : Lang("enemyTurnText"))+(window.loft.config.StepTimeLimit - r));
                    }
                    if(r > window.loft.config.StepTimeLimit){
                        if(!this.state.playersStep){
                            //this.socketSend({action:"TIMEOUTOPPO"});
                            this.suggestNewOneGame(Lang("enemyLostByTimeout"));
                        }
                        this.consoleLog(Lang("gameOverByTimeout"));
                        clearInterval(this.state.timeoutCheckInterval);
                    }
                }
            },1000)
        }
        this.setMazafuckinState(newStateObject);
    }

    getBotStep = (color) => {
        this.act({
            action: 'get-bot-step',
            data: {
                playstage: this.state.debug ? 3 : this.state.playstage,
                mask: this.getDeskMask(),
                color: color[0]
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
            id: this.state.game_id,
            data: {
                mask:   this.getDeskMask(),
                pflag:  pflag,
                from:   koordsfrom,
                to:     koordsto,
                effectivity: this.cells[koordsfrom].possibilities[koordsto].effectivity,
                color:  cells[koordsfrom].color[0],
                game_id:this.state.game_id,
                gtoken: this.state.gtoken,
            },
            success: (res)=>{
                if(res.success){
                    if(this.state.game_id === 0){
                        if(res.data.game_id){
                            this.setMazafuckinState({game_id: res.data.game_id, gtoken: res.data.gtoken});
                        }else{
                            window.loft.AjaxAvailable = false;
                        } 
                    }
                }
            }
        });
    }

    










    // Animations and logic

    rampage = (steps, word="", returnObj=false) => {
        clearTimeout(this.state.rampageTO);
        let newstate = {
            rampageCode:<Rampage steps={steps} word={word} />,
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

    doStep = (koordsto,koordsfrom=this.state.selectedChecker,newPlayersStep=false,pflag=true) => {
        if(pflag!==null && (this.state.writesteps || (this.state.game_id===0 && this.state.writestats))) this.saveStepResults(koordsto,koordsfrom,pflag);
        
        if(window.loft.usersettings.animation==='0'){
            this.theStep(koordsto,koordsfrom,newPlayersStep);
        }else{
            this.stepAnimation(koordsto,koordsfrom,newPlayersStep);
        }
    }

    theStep = (koordsto,koordsfrom=this.state.selectedChecker,newPlayersStep=false) => {
        let {playerInfo,opponentInfo,bestMove,cells, gameTotalStat} = this.state;
        let {color} = cells[koordsfrom];
        let steps = cells[koordsfrom].possibilities[koordsto].path.length;

        if (typeof(cells[koordsfrom].possibilities[koordsto].kills) !== "undefined") {
            cells[koordsfrom].possibilities[koordsto].kills.forEach((k, v) => {
                cells[k].checker = false;
                cells[k].color = false;
                cells[k].selectedChecker = false;
                cells[k].damka = false;
            });
        }
        
        if(bestMove===null || bestMove.steps<steps || bestMove.effectivity < cells[koordsfrom].possibilities[koordsto].effectivity){
            bestMove = {
                mask: this.getDeskMask(this.state.cells,true),
                from:koordsfrom,
                to:koordsto,
                steps:steps,
                path:cells[koordsfrom].possibilities[koordsto].path,
                effectivity:cells[koordsfrom].possibilities[koordsto].effectivity
            };
        }
        if(cells[koordsfrom].color === playerInfo.color){
            playerInfo.steps += steps;
            playerInfo.moves++;
        }else{
            opponentInfo.steps += steps;
            opponentInfo.moves++;
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
        if(playerInfo.moves + opponentInfo.moves > 4){
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
        if (this.state.game === "checkers" || this.state.game === "giveaway") {
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
                        playerInfo.status = "done";
                        opponentInfo.status = "done";
                    }
                }
            }
        }
        let newstate = {}
        if(steps>2) newstate = this.rampage(steps, "", true);
        Noise(steps);

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

        let gamestatuschecked = ((lastStepColor === this.state.playerInfo.color && this.state.playerInfo.status === "in_game") || (lastStepColor === this.state.opponentInfo.color && this.state.opponentInfo.status === "in_game"));
        
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
        let steps = possibility.path.length;

        let ooo = document.querySelector(`.ucell[koords="${k1}"]`);

        let x1 = ooo.offsetLeft;
        let y1 = ooo.offsetTop;

        ooo = document.querySelector(`.ucell[koords="${k2}"]>.empty`);

        let x2 = ooo.offsetLeft;
        let y2 = ooo.offsetTop;

        let dx = x1 - (x1 - x2) / 2;
        let dy = y1 - (y1 - y2) / 2;

        if (index === steps - 1 && steps > this.state.epicstepnum && Math.random() > 0.5 && !cells[koordsfrom].damka) {
            
            if (steps > this.state.epicstepnum + 2 || Math.random() > 0.5) {
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

        if (index === steps - 1) {
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
        if (this.state.game === "corners" && cells[koordsfrom].possibilities[koordsto].path.length > 2) {
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
        playerInfo.status = "in_game";
        playerInfo.color = "white";
        playerInfo.steps = 0;
        playerInfo.moves = 0;
        playerInfo.done = 0;
        this.setMazafuckinState({
            playersStep: true,
            opponentInfo: {
                name: "bot"+Math.round(Math.random()*1000 + 1000), 
                status: "in_game",
                color: "black",
                steps: 0,
                moves: 0,
                done: 0
            },
            afkcounter: 0,
            cells: this.dropCheckersToDefaults(),
            playstage: 1,
            online: false,
            playerInfo: playerInfo,
            modal: {code: "", bg: true, panel: true, autoclose: false},
            consoleText: Lang("disconnected") + ". " + Lang("yourTurnText")
        });
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
        if(b!==null && b.steps>3){
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
        if(typeof(this.state.cells[koords])!=="undefined" && this.state.playersStep && this.state.playerInfo.status==="in_game")
        {
            //Cell exists and it is a players turn to do a step
            if(this.state.cells[koords].color===this.state.playerInfo.color || this.state.cells[koords].color===false){
                //If checker is player`s one or empty cell
                if(cells[koords].checker!==false){
                    //New checker click
                    let newselectedChecker = false;
                    if(cells[koords].color === this.state.playerInfo.color && this.state.selectedChecker !== koords){
                        newselectedChecker = koords;
                    }
                    Noise("checker-take");
                    this.setMazafuckinState({selectedChecker: newselectedChecker});
                }else{
                    //Trying to do a step
                    if(this.state.selectedChecker!==false){
                        //If we have an active checker
                        if(typeof(cells[this.state.selectedChecker].possibilities[koords]) !== "undefined"){
                            //If we have such step as possible
                            if(this.state.online){
                                let param = {
                                    action:"THESTEP",
                                    from:this.state.selectedChecker,
                                    to:koords,
                                    steps: cells[this.state.selectedChecker].possibilities[koords].len,
                                    checker:cells[this.state.selectedChecker].checker,
                                    effectivity: cells[this.state.selectedChecker].possibilities[koords].effectivity
                                };
                                if(this.state.playerInfo.done>9) param.checkdone = 1;
                                if(this.state.socketOpened) this.socketSend(param);
                            }else{
                                this.doStep(koords);
                            }
                        }else{
                            //Unable to go there
                            //cells[this.state.selectedChecker].active = false;
                            
                            let needToEatMore = false;
                            if (this.state.game === "checkers" || this.state.game === "giveaway") {
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
        let checkers = (this.state.game === "checkers" || this.state.game === "giveaway");
        if(Object.keys(this.state.cells).length > 0){
            renderedField = Object.keys(this.state.cells).map((koords) => {
                let {x,y,k,color,checker,possibilities} = this.state.cells[koords];
                let damka = (((color === "black" && y === 8) || (color === "white" && y === 1) || this.state.cells[koords].damka) && checkers);
                let active = koords === this.state.selectedChecker;
                return (<Cell onCheckerClick={this.onCheckerClick} x={x} y={y} key={k} k={k} checker={checker} damka={damka} color={color} active={active} variable={possibilities} />);
            });
        }

        let fieldClass = "";
        if (this.state.playerInfo.color === "black") fieldClass = "forBlacks";

        return (
            <div className="ucon">
                <AppHeader 
                        gamename={this.state.game} 
                        playerName={this.state.playerInfo.display_name}
                        playerColor={this.state.playerInfo.color}
                        playerStatus={this.state.playerInfo.status}
                        playerStat={window.loft.isGuest ? {} : this.state.playerInfo.stat}
                        searching={this.state.searchingOnlineOpponent} 
                        count={this.state.searchingOnlineCounter} 
                        online={this.state.online}
                        serverInfo={this.state.serverInfo}
                        startNewSearch={this.startNewSearch}
                        stopTheSearch={this.stopTheSearch}
                        updateSetting={this.updateSetting}
                        setAppState={this.props.setAppState}
                        isGuest={this.props.isGuest}
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
                        player={this.state.playerInfo.display_name}
                        opponent={this.state.opponentInfo.display_name}
                        searching={this.state.searchingOnlineOpponent} 
                        count={this.state.searchingOnlineCounter} 
                        serverInfo={this.state.serverInfo}
                        rec={this.state.writesteps}
                    />
                </div>
        </div>
        );
    }
}
