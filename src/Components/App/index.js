import React from 'react';

import AppHeader from '../AppHeader/';
import Cell from '../Cell/';
import Console from '../Console/';
import Fanfara from '../Fanfaras';
import Modal from '../Modal';
import Rampage from '../Rampage';
//import Board from './wood_texture.jpg';
import Settings from '../../Funcs/settings';

import './app.css';

const server = window.location.hostname.length > 7 ? window.location.hostname : "smix-soft.ru";
const wsport = "8080";


export default class App extends React.Component{

    state = {
        /* USERS DYNAMIC INFO */
        cells: {},
        bestMove: null,
        playerInfo: {
            name: "player"+Math.round(Math.random()*1000 + 1000), 
            status: "in_game",
            color: "white",
            signed: false,
            steps: 0,
            moves: 0,
            cells: 12,
            done: 0,
            possibilities: 10,
            statistics: {
                games:0,won:0,lost:0,steps:0,moves:0,exp:0,lvl:1
            }
        },
        opponentInfo: {
            name: "bot"+Math.round(Math.random()*1000 + 1000), 
            status: "in_game",
            color: "black",
            steps: 0,
            moves: 0,
            cells: 12,
            done: 0,
            possibilities: 10,
        },
        game: window.location.href.split("/").pop(),
        /* USER PREFERENCES */
        settings: new Settings(),
        usersettings: {},
        /* TECH INFO */
        selectedChecker: false,
        playersStep: true,
        lastStep: "",
        lastStepTime: 0,
        animationSpeed: 45,
        isLoading: true,
        online: false,
        socketOpened: false,
        botspeed: 1,
        epicstepnum: 2,
        playstage: 1,
        consoleText: "",
        modal: {
            code: "", header: "", bg: true, panel: true, autoclose: false
        },
        gameTotalStat: {
            TWD: 0, TBD: 0, TC: 24, MC: 0
        },
        rampageCode: "",
        rampageTO: null,
        targetCells: {}, 
        /*stepperproperties: {color:"white",koords:"0:0",scale:1},*/
        searchingOnlineOpponent: false,
        searchingOnlineCounter: 0,
        timeoutCheckInterval: false,
        XMLHRAvailable: false,
        serverInfo: {
            avgwaittime: {cnt: 0, ttl: 0, avg: 0},
            playersstat: {total: 0, searching: 0, in_game: 0},
            steptimelimit: 30
        },
        
        /* DEV FIELDS */
        debug: false,
        autochess: false,
        writesteps: false,
        writestats: false,
        game_id: 0,
        gtoken: "",
    };

    componentDidMount() {
        let state = {};
        state.usersettings = this.state.settings.getSettings();
        let param = {action:"checkcheck"};
        if(state.usersettings.atoken!==""){
            param = {action:"auth",token:state.usersettings.atoken};
        }
        
        this.XMLHR(param,(data)=>{
            this.initiation(state,data);
        },()=>{
            this.initiation(state);
        });

        //setTimeout(()=>this.consoleLog("Вы должны взять больше!"), 2000);
    }

    initiation = (state,data=false) => {
        let {playerInfo, opponentInfo} = this.state;
        if(state.usersettings.atoken!=="" && data){
            if(data.success){
                playerInfo.signed = true;
                playerInfo.name = data.data.name;
                playerInfo.login = data.data.login;
                playerInfo.statistics = data.data;
            }else{
                this.saveSettingsOption("atoken");
            }
        }
        if(state.usersettings.mode === "online") this.connectSocket();
        if(data){
            state.writesteps = data.WriteSteps;
            state.writestats = data.WriteStats;
            state.debug = data.Debug;
            state.XMLHRAvailable = true;
        }
        if(this.state.autochess){
            playerInfo.name = "bot"+Math.round(Math.random()*1000 + 1000);
        }

        state.playerInfo = playerInfo;

        if (state.usersettings.mode === "bot") {
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
        
        state.isLoading = false;

        state.targetCells = this.setTargetCells();

        state.cells = this.dropCheckersToDefaults(state.debug);
        
        this.setMazafuckinState(state);
        
        if(this.state.autochess || !state.playersStep) setTimeout(() => this.botStep("black"), 300);
    }

    socketReplyProcessing(response){
        response = JSON.parse(response.data);
        let data = response.data;
        if(response.response==="SERVERINFO"){
            if(data!==null) this.setMazafuckinState({serverInfo: data});
            return;
        }
        if(response.response==="REGISTERED"){
            if(data!==null){
                let {playerInfo} = this.state;
                for(let k in data){
                    playerInfo[k] = data[k];
                }
                this.setMazafuckinState({ playerInfo: playerInfo});
            }
            return;
        }
        if(response.response==="STARTGAME"){
            clearInterval(this.state.searchingOnlineOpponent);
            let playersStep = data.lastStep!==this.state.playerInfo.token;
            let colorInfo = ". Вы играете "+(data.players[this.state.playerInfo.token].color==="white"?"белыми":"чёрными");
            let newStateObject = {
                playersStep: playersStep,
                lastStep: data.lastStep,
                lastStepTime: data.lastStepTime,
                opponentInfo: data.players[data.players[this.state.playerInfo.token].opponent],
                playerInfo: data.players[this.state.playerInfo.token],
                consoleText: (playersStep?"Ваш ход!":"Ожидание хода противника")+colorInfo,
                isLoading: false,
                online: true,
                cells: this.dropCheckersToDefaults(),
                searchingOnlineOpponent: false,
                searchingOnlineCounter: 0,
                timeoutCheckInterval: setInterval(()=>{
                    if(this.state.online && this.state.playerInfo.status === "in_game" && this.state.lastStepTime>0){
                        let r = Math.floor(new Date().getTime() / 1000) - this.state.lastStepTime;
                        if(r > this.state.serverInfo.steptimelimit * 2 / 3){
                            this.consoleLog((this.state.playersStep?"Ваш ход! ":"Ожидание хода противника... ")+(this.state.serverInfo.steptimelimit - r));
                        }
                        if(r > this.state.serverInfo.steptimelimit){
                            if(!this.state.playersStep){
                                this.socketSend({action:"TIMEOUTOPPO"});
                                this.suggestNewOneGame("Противнику зачитано поражение за бездействие. ");
                            }
                            this.consoleLog("Завершение игры по таймауту");
                            clearInterval(this.state.timeoutCheckInterval);
                        }
                    }
                },1000)
            }
            this.setMazafuckinState(newStateObject);
            return;
        }
        if(response.response==="OPPOQUIT"){
            let {playerInfo,opponentInfo} = this.state;
            playerInfo['status'] = data[this.state.playerInfo.token]['status'];
            opponentInfo['status'] = data[this.state.opponentInfo.token]['status'];
            playerInfo['done'] = data[this.state.playerInfo.token]['done'];
            opponentInfo['done'] = data[this.state.opponentInfo.token]['done'];
            this.setMazafuckinState({playerInfo:playerInfo,opponentInfo:opponentInfo});
        }
        if(response.response==="THESTEP"){
            const a = this.state.cells[data.from].possibilities[data.to];

            if(a !== "undefined"){
                let o = {
                    lastStep: data.lastStep,
                    lastStepTime: data.lastStepTime
                };
                if(typeof(data[this.state.playerInfo.token]) !== "undefined" && (data[this.state.playerInfo.token]['status'] !== this.state.playerInfo['status'] || this.state.opponentInfo['status'] !== data[this.state.opponentInfo.token]['status'])){
                    //let {playerInfo, opponentInfo} = this.state;
                    o.playerInfo = this.state.playerInfo;
                    o.opponentInfo = this.state.opponentInfo;
                    o.playerInfo['status'] = data[this.state.playerInfo.token]['status'];
                    o.opponentInfo['status'] = data[this.state.opponentInfo.token]['status'];
                    o.playerInfo['done'] = data[this.state.playerInfo.token]['done'];
                    o.opponentInfo['done'] = data[this.state.opponentInfo.token]['done'];
                }
                this.setMazafuckinState(o);

                this.doStep(
                    data.to,
                    data.from,
                    data.lastStep!==this.state.playerInfo.token,
                    null
                );
                
            }
            return;
        }
        /*if(response.response==="GAMEOVER"){
            if(response.data.reason === "OPPOTIMEOUT"){
                clearInterval(this.state.timeoutCheckInterval);
                this.setMazafuckinState({
                    timeoutCheckInterval: false,
                    online: false,
                    consoleText: "Таймаут. Противник не отвечает."
                });
            }
            if(response.data.reason === "TIMEOUT"){
                clearInterval(this.state.timeoutCheckInterval);
                this.setMazafuckinState({
                    timeoutCheckInterval: false,
                    online: false,
                    consoleText: "Вам засчитано поражение за бездействие."
                });
            }
        }*/
        this.consoleLog(response.response);
    }

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

    hideModal = () => {
        let a = document.querySelectorAll(".show");
        for(let i=0;i<a.length;i++) a[i].className = a[i].className.replace("show","");
        setTimeout(()=>{
            this.setMazafuckinState({modal: {code: "", header: "", bg: true, panel: true, autoclose: false}});
        },300);
    }

    showModal = (code,header="",bg=true,panel=true,autoclose=false) => {
        this.setMazafuckinState({modal: {code: code, header: header, bg: bg, panel: panel, autoclose: autoclose}});
    }

    XMLHR = (params="",onsuccess=()=>{},onerror=()=>{},responseType="json",method="POST",url=`//${server}/api/r.php`) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return false;
            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.statusText);
                onerror();
            } else {
                let data = xhr.responseText;
                if(responseType==="json"){
                    try {
                        data = JSON.parse(data);
                        console.log(data);
                    } catch(e) {
                        console.log(e,data);
                    }
                }
                onsuccess(data);
            }
        }
        if(typeof(params) === "object") params = this.object2string(params);
        console.log(params);
        xhr.send(params);
    }

    doStep = (koordsto,koordsfrom=this.state.selectedChecker,newPlayersStep=false,pflag=true) => {
        if(pflag!==null && (this.state.writesteps || (this.state.game_id===0 && this.state.writestats))) this.saveStepResults(koordsto,koordsfrom,pflag);
        
        if(this.state.usersettings.animation==='0'){
            this.theStep(koordsto,koordsfrom,newPlayersStep);
        }else{
            this.stepAnimation(koordsto,koordsfrom,newPlayersStep);
        }
    }

    theStep = (koordsto,koordsfrom=this.state.selectedChecker,newPlayersStep=false) => {
        //console.log("step",koordsfrom,koordsto);
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

        let consoleText = newPlayersStep?"Ваш ход!":"Ожидание хода противника";
        if(playerInfo.done === 12 || opponentInfo.done === 12) consoleText = "Игра окончена";

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

    saveStepResults = (koordsto,koordsfrom,pflag) => {
        if(this.state.online || !this.state.XMLHRAvailable) return;
        let {cells} = this.state;
        let postdata = {
            action: 'saveStep',
            mask: this.getDeskMask(),
            pflag: pflag,
            from: koordsfrom,
            to: koordsto,
            effectivity: Math.diagonalEffectivity(cells[koordsfrom],cells[koordsto],cells[koordsfrom].color, this.state.playstage),
            color: cells[koordsfrom].color[0],
            game_id: this.state.game_id,
            gtoken: this.state.gtoken,
        };
        this.XMLHR(postdata,(data)=>{
            if(data.success){
                if(this.state.game_id===0){
                    if(data.data.game_id){
                        this.setMazafuckinState({game_id: data.data.game_id, gtoken: data.data.gtoken});
                    }else{
                        this.setMazafuckinState({XMLHRAvailable: false});
                    } 
                }
            }
        });
    }

    getBotStep = (color) => {
        let postdata = {
            action: 'getStep',
            playstage: this.state.debug?3:this.state.playstage,
            mask: this.getDeskMask(),
            color: color[0]
        };
        this.XMLHR(postdata,(data)=>{
            if(!data.success){
                this.iiStep(color);
            }else{
                if(this.state.cells[data.data.from].color===color && typeof(this.state.cells[data.data.from].possibilities[data.data.to])!=="undefined"){
                    this.doStep(data.data.to, data.data.from, true, null);
                }else{
                    this.iiStep(color);
                }
            }
        });
    }

    botStep = (lastStepColor) => {
        let color = this.state.autochess?(lastStepColor==="white"?"black":"white"):(this.state.playerInfo.color==="white"?"black":"white");

        let gamestatuschecked = ((lastStepColor === this.state.playerInfo.color && this.state.playerInfo.status === "in_game") || (lastStepColor === this.state.opponentInfo.color && this.state.opponentInfo.status === "in_game"));
        
        if((this.state.playersStep===false || this.state.autochess) && this.state.online===false && gamestatuschecked && this.state.usersettings.mode === "bot"){
            setTimeout(()=>{

                if(this.state.XMLHRAvailable && !this.state.autochess){
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

            stepper.style.transform = `translate(${ooo.offsetLeft}px, ${ooo.offsetTop}px) scale(1.5)`;
            stepper.className = stepper.className.replace(" animated", "") + " animated";

            await this.sleep(1000);

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
            cells[koordsfrom].possibilities[koordsto].path = cells[koordsfrom].possibilities[koordsto].path.filter((v,k) => k%2==0);
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
                                console.log(cells[this.state.selectedChecker].possibilities);
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
                                if (needToEatMore.more) this.consoleLog("Вы должны взять больше!");
                                else this.consoleLog("Вы должны есть!");
                                for (let k in needToEatMore.kills) {
                                    let ch = document.querySelector(`.ucell[koords='${needToEatMore.kills[k]}'] .uchecker`);
                                    ch.className = `${ch.className} deadly`;
                                }
                            } else {
                                this.consoleLog("Ход не возможен");
                            }
                            
                        }
                    }
                }
            }
        }
    }

    consoleLog = (text) => {
        this.setMazafuckinState({consoleText: text});
    }

    updateSetting = (key, val) => {
        console.log("state updated");
        let {usersettings} = this.state;
        usersettings[key] = val;
        this.setState({usersettings: usersettings});
    }

    socketSend = (param) => {
        console.log(param);
        this.socket.send(JSON.stringify(param));
    }

    connectSocket = () => {
        let url = `wss://${server}:${wsport}`;
        console.log(`Connecting socket ${url}`);
        this.socket = new WebSocket(url);
        this.socket.onopen = () => {
            this.consoleLog("Подключен");
            this.setMazafuckinState({socketOpened: true});
            this.startNewSearch(true);
        };
        this.socket.onclose = evt => { 
            if (evt.wasClean) {
                this.consoleLog("Отключен");
            } else {
                this.consoleLog("Сервер не доступен");
            }
            this.setMazafuckinState({socketOpened: false});
            console.log('Код: ' + evt.code + ' причина: ' + evt.reason);
        };
        this.socket.onerror = evt => { 
            console.log('Ошибка подключения сокета', evt);
            this.setMazafuckinState({socketOpened: false, consoleText: "Сервер не доступен"});
        };
        this.socket.onmessage = evt => { 
            this.socketReplyProcessing(evt);
        };
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
            consoleText: "Отключен. Ваш ход."
        });
    }

    continueWithSameOpponent = () => {
        if(this.state.socketOpened) this.socketSend({action:"REREGISTER"});
        else this.consoleLog("Сервер не доступен");
        this.clearPlayerInfoAfterGameOver();
    }

    searchNewOpponent = (reset=true,socketOpened=this.state.socketOpened) => {
        let regdata = {
            action:"REGISTER",
            game: this.state.game,
            name: this.state.playerInfo.name,
        };
        if(typeof(this.state.playerInfo.login)!=="undefined") regdata['login'] = this.state.playerInfo.login;
        if(socketOpened) this.socketSend(regdata);
        else this.consoleLog("Сервер не доступен");
        if(reset) this.clearPlayerInfoAfterGameOver();
    }

    suggestNewOneGame = (text="") => {
        this.showModal(
            <div>
                <input type="button" value="Нет" onClick={this.clearPlayerInfoAfterGameOver} /> <input type="button" onClick={()=>{ this.searchNewOpponent() }} value="Да"/>
            </div>,
            text+"<br />Найти новую игру?"
        );
    }

    quit = (suggestNewOne=true,juststopsearching=true) =>{
        if(this.state.socketOpened) this.socketSend({action:"QUIT"});
        else this.consoleLog("Сервер не доступен");
        this.setMazafuckinState({
            online: false,
            consoleText: "Отключен"
        });
        if(suggestNewOne) this.suggestNewOneGame();
        else if(juststopsearching) this.clearPlayerInfoAfterGameOver();
    }

    startNewSearch = (socketOpened=this.state.socketOpened) => {
        clearInterval(this.state.searchingOnlineOpponent);
        this.setMazafuckinState({
            consoleText: "Поиск противника", 
            searchingOnlineCounter: 0,
            searchingOnlineOpponent: setInterval(()=>{
                this.setMazafuckinState({searchingOnlineCounter: this.state.searchingOnlineCounter+1})
            },1000)
        });
        this.searchNewOpponent(false,socketOpened);
    }

    stopTheSearch = () => {
        clearInterval(this.state.searchingOnlineOpponent);
        this.setMazafuckinState({
            consoleText: "", 
            searchingOnlineCounter: 0,
            searchingOnlineOpponent: false
        });
        this.quit(false,false);
    }

    object2string = (obj) => {
        let s = [];
        for(let i in obj){
            s.push(i+"="+encodeURIComponent(obj[i]));
        }
        return s.join("&");
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

    setMazafuckinState = (o) =>{
        //console.log("Changing state",o);
        this.setState(o);
    }

    /*-------------------------*/
    

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

    render(){
        let renderedField = '';
        let checkers = (this.state.game === "checkers" || this.state.game === "giveaway");
        if(Object.keys(this.state.cells).length > 0){
            renderedField = Object.keys(this.state.cells).map((koords) => {
                let {x,y,k,color,checker,possibilities,priority} = this.state.cells[koords];
                let damka = (((color === "black" && y === 8) || (color === "white" && y === 1) || this.state.cells[koords].damka) && checkers);
                let active = koords === this.state.selectedChecker;
                return (<Cell onCheckerClick={this.onCheckerClick} x={x} y={y} key={k} k={k} checker={checker} damka={damka} color={color} active={active} variable={priority} />);
            });
        }

        let fieldClass = this.state.isLoading ? "loading" : "";
        if (this.state.playerInfo.color === "black") fieldClass += " forBlacks";

        return (
            <div className="ucon">
                <AppHeader 
                        history={this.props.history} 
                        gamename={this.state.game} 
                        playerName={this.state.playerInfo.name}
                        playerColor={this.state.playerInfo.color}
                        playerStatus={this.state.playerInfo.status}
                        playerSigned={this.state.playerInfo.signed}
                        playerStat={this.state.playerInfo.signed ? this.state.playerInfo.statistics : {}}
                        searching={this.state.searchingOnlineOpponent} 
                        count={this.state.searchingOnlineCounter} 
                        online={this.state.online}
                        serverInfo={this.state.serverInfo}
                        hideModal={this.hideModal}
                        showModal={this.showModal}
                        startNewSearch={this.startNewSearch}
                        stopTheSearch={this.stopTheSearch}
                        updateSetting={this.updateSetting}
                        usersettings={this.state.usersettings}
                        XMLHR={this.XMLHR}
                        quit={this.quit}
                />
                <Fanfara
                        playerInfo={this.state.playerInfo} 
                        opponentInfo={this.state.opponentInfo} 
                        bestMove={this.state.bestMove}
                        continueWithSameOpponent={this.continueWithSameOpponent}
                        searchNewOpponent={this.searchNewOpponent}
                        quit={this.quit}
                        XMLHR={this.XMLHR}
                        updatePI={this.updatePI}
                        rampage={this.rampage}
                        showBestMove={this.showBestMove}
                />
                <Modal
                        closer={this.hideModal} 
                        modal={this.state.modal}
                />
                <div className="umaincon animate__fadeInRight animate__animated">
                    <div className={fieldClass} id="ufield">
                        <div className="ufcn">
                        <div className="uchecker black" id="stepper">&nbsp;</div>
                        {renderedField}
                        </div>
                    </div>
                    <Console
                        text={this.state.consoleText} 
                        online={this.state.online}
                        rampageCode={this.state.rampageCode}
                        player={this.state.playerInfo.name}
                        opponent={this.state.opponentInfo.name}
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
