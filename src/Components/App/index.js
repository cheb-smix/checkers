import React from 'react';

import AppHeader from '../AppHeader/';
import Cell from '../Cell/';
import Console from '../Console/';
import Fanfara from '../Fanfaras';
import Modal from '../Modal';
import Rampage from '../Rampage';
import Board from './wood_texture.jpg';
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
            done: 0,
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
            done: 0,
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
        playstage: 1,
        isMobile: null,
        consoleText: "",
        modal: {
            code: "", header: "", bg: true, panel: true, autoclose: false
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
        debug: true,
        autochess: false,
        writesteps: false,
        writestats: false,
        game_id: 0,
        gtoken: "",
    };

    componentDidMount() {
        let state = {};
        state.usersettings = this.state.settings.getSettings();
        state.isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        let param = {action:"checkcheck"};
        if(state.usersettings.atoken!==""){
            param = {action:"auth",token:state.usersettings.atoken};
        }
        
        this.XMLHR(param,(data)=>{
            this.initiation(state,data);
        },()=>{
            this.initiation(state);
        });
    }

    initiation = (state,data=false) => {
        let {playerInfo} = this.state;
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
        if(state.usersettings.autoconnect==="1") this.connectSocket();
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
        state.isLoading = false;

        state.cells = this.dropCheckersToDefaults(state.debug);

        state.targetCells = this.setTargetCells();
        
        this.setMazafuckinState(state);
        
        if(state.isMobile){
            let c = document.querySelector('.neonconsole');
            c.className = "console glitch";
            c.style.textAlign = "center";
            c.style.fontSize = "18px";
            c.style.fontFamily = "Federo";
            c.style.textTransform = "uppercase";
        }
        if(this.state.autochess) this.botStep("black");
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

    rampage = (steps,word="") => {
        clearTimeout(this.state.rampageTO);
        this.setMazafuckinState({rampageCode:<Rampage steps={steps} word={word} />,rampageTO:setTimeout(()=>{
            this.setMazafuckinState({rampageCode:"",rampageTO:null});
        },3000)});
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
        if(this.state.usersettings.animation!=="0"){
            this.stepAnimation(koordsto,koordsfrom,newPlayersStep);
        }else{
            this.theStep(koordsto,koordsfrom,newPlayersStep);
        }
    }

    theStep = (koordsto,koordsfrom=this.state.selectedChecker,newPlayersStep=false) => {
        console.log("step",koordsfrom,koordsto);
        let {playerInfo,opponentInfo,bestMove,cells} = this.state;
        let steps = cells[koordsfrom].possibilities[koordsto].len;

        if (typeof(cells[koordsfrom].possibilities[koordsto].kills) !== "undefined") {
            //console.log(cells[koordsfrom].possibilities[koordsto]);
            cells[koordsfrom].possibilities[koordsto].kills.forEach((k, v) => {
                cells[k].checker = false;
                cells[k].color = false;
                cells[k].selectedChecker = false;
                cells[k].damka = false;
                //cells[k] = {x:cells[k].x,y:cells[k].y,k:cells[k].key,checker:false,color:false,possibilities:{},active:false};
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
        
        playerInfo.done = this.countDoneCheckers(cells,this.state.playerInfo.color);
        opponentInfo.done = this.countDoneCheckers(cells,this.state.opponentInfo.color);
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
        this.setMazafuckinState({
            playerInfo:playerInfo,
            opponentInfo:opponentInfo,
            bestMove:bestMove,
            playersStep:newPlayersStep,
            playstage:playstage,
            consoleText: consoleText,
            selectedChecker: false,
            cells:cells
        });
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
            effectivity: this.calculateDiagonalEffectivity(cells[koordsfrom],cells[koordsto],cells[koordsfrom].color),
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

    calculateDiagonalEffectivity = (c1,c2,color="any") => {
        let diagonalCorrection = 1;
        let dia1 = c1.x-c1.y;
        let dia2 = c2.x-c2.y;
        let dd = Math.abs(dia1 - dia2);
        if((dia1 > dia2 && color==="white") || ( dia1 < dia2 && color==="black")) diagonalCorrection = -1;
        if(dia1 === dia2) diagonalCorrection = this.state.playstage===3?1:0;
        let lessPriorityCellsCorrection = 1/(Math.abs(4.5-c2.x) * Math.abs(4.5-c2.y) / 4);
        lessPriorityCellsCorrection = 1;
        let hypotenuse = this.calculatePifagor(c1,c2);
        let p = (hypotenuse * lessPriorityCellsCorrection + dd) * diagonalCorrection;
        //console.log("c1",c1.x,c1.y,"c2",c2,"dia",dia1,dia2,dd,diagonalCorrection,"pif",p);
        return {effectivity: p,dia1,dia2,dd,diagonalCorrection,lessPriorityCellsCorrection,hypotenuse};
    }

    calculatePifagor = (c1,c2) => {
        return Math.sqrt(Math.pow(c1.x - c2.x,2)+Math.pow(c1.y - c2.y,2));
    }
    
    calculatePifagorColored = (c1,c2,color="any") => {
        let dx = 0, dy = 0, directionCorrection = 1;
        if(color==="black"){
            dx = c1.x - c2.x;
            dy = c2.y - c1.y;
        }else{
            dx = c2.x - c1.x;
            dy = c1.y - c2.y;
        }
        if(color!=="any"){
            if(dx<0 || dy<0) directionCorrection = -1;
        }
        return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2)) * directionCorrection;
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
                    //this.iiStep(color,false,data.data);
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
        
        if((this.state.playersStep===false || this.state.autochess) && this.state.online===false && gamestatuschecked){
            setTimeout(()=>{

                if(this.state.XMLHRAvailable && !this.state.autochess){
                    this.getBotStep(color);
                }else{
                    this.iiStep(color);
                }

            },this.state.botspeed * 1000 * Math.random());
        }
    }

    oneAnimatedStep = async (stepper, checker, possibility, index, t, headerHeight, koordsfrom, koordsto, lastStepColor, newPlayersStep, cells) => {
        stepper.style.transition = t+"ms all ease-in";

        let k1 = possibility.path[index - 1];
        let k2 = possibility.path[index];
        let steps = possibility.path.length;

        let ooo = document.querySelector(`.ucell[koords="${k1}"]`);

        let x1 = ooo.offsetLeft;
        let y1 = ooo.offsetTop + headerHeight;

        ooo = document.querySelector(`.ucell[koords="${k2}"]>.empty`);

        let x2 = ooo.offsetLeft;
        let y2 = ooo.offsetTop + headerHeight;

        let dx = x1 - (x1 - x2) / 2;
        let dy = y1 - (y1 - y2) / 2;

        stepper.style.top = dy + "px";
        stepper.style.left = dx + "px";
        stepper.style.transform = "scale(1.5)";
        
        await this.sleep(t);

        stepper.style.transition = t+"ms all ease-out";
        stepper.style.top = (ooo.offsetTop + headerHeight) + "px";
        stepper.style.left = ooo.offsetLeft + "px";
        stepper.style.transform = "scale(1)";

        await this.sleep(t);
        
        /*if(steps > 4){
            await this.sleep(t);
            
            stepper.style.transition = (t*3)+"ms all ease";
            stepper.style.top = (ooo.offsetTop + headerHeight) + "px";
            stepper.style.left = ooo.offsetLeft + "px";
            stepper.style.transform = "scale(2)";

            await this.sleep(t*3);
            stepper.style.transition = (t/2)+"ms all ease";
            stepper.style.transform = "scale(1)";

        }else{
            await this.sleep(t);
            stepper.style.transition = t+"ms all ease-out";
            stepper.style.top = (ooo.offsetTop + headerHeight) + "px";
            stepper.style.left = ooo.offsetLeft + "px";
            stepper.style.transform = "scale(1)";
        }*/
        if (koordsto === possibility.path[index] || index === steps) {
            stepper.style.display = "none";
            stepper.style.transition = "none";
            checker.style.opacity = 1;
            if(steps>2) this.rampage(steps);

            this.theStep(koordsto,koordsfrom,newPlayersStep);
            this.botStep(lastStepColor);
            return;
        } else {
            index++;

            if (typeof(possibility.path[index]) !== "undefined") {

                t = this.calculatePifagor(cells[possibility.path[index - 1]], cells[possibility.path[index]]) * (this.state.animationSpeed - (possibility.len * 2));
                
                setTimeout(async () => {
                    this.oneAnimatedStep(stepper, checker, possibility, index, t, headerHeight, koordsfrom, koordsto, lastStepColor, newPlayersStep, cells);
                }, t*2);

            }
        }
    }

    stepAnimation = (koordsto,koordsfrom=this.state.selectedChecker,newPlayersStep=false,p=false) => {
        let {cells} = this.state;
        let possibility = cells[koordsfrom].possibilities[koordsto];
        
        let stepper = document.getElementById("stepper");
        let headerHeight = document.querySelector(".uheader").offsetHeight;
        
        let checker = document.getElementById(cells[koordsfrom].checker);
        let lastStepColor = cells[koordsfrom].color;
        
        checker.style.opacity = 0;
        stepper.className = "uchecker " + cells[koordsfrom].color + (cells[koordsfrom].damka ? " damka" : "");
        stepper.style.top = (checker.offsetTop + headerHeight)+"px";
        stepper.style.left = checker.offsetLeft +"px";
        stepper.style.display = "block";

        let index = 1;
        let t = this.calculatePifagor(cells[koordsfrom], cells[possibility.path[index]]) * (this.state.animationSpeed - (possibility.len * 2));

        setTimeout(async () => {
            this.oneAnimatedStep(stepper, checker, possibility, index, t, headerHeight, koordsfrom, koordsto, lastStepColor, newPlayersStep, cells);
            index++;
        }, t*2);
    }

    onCheckerClick = (koords) => {
        let {cells} = this.state;
        if(typeof(this.state.cells[koords])!=="undefined" && this.state.playersStep && this.state.playerInfo.status==="in_game"){
            //Cell exists and it is a players turn to do a step
            if(this.state.cells[koords].color===this.state.playerInfo.color || this.state.cells[koords].color===false/* || (this.state.cells[koords].color==="white" && this.state.online===false)*/){
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
                            cells[this.state.selectedChecker].active = false;
                            this.consoleLog("Ход не возможен");
                        }
                    }
                }
            }
        }
    }

    consoleLog = (text) => {
        this.setMazafuckinState({consoleText: text});
    }

    /*loadSettings = () => {
        let {usersettings} = this.state;
        let o = {usersettings:usersettings};
        for(let key in o.usersettings){
            let v = localStorage.getItem(key);
            if(typeof(v)==="string"){
                v = v==="true"?true:v;
                v = v==="false"?false:v;
                o.usersettings[key]=v;
            }
        }
        o.isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        return o;
    }

    saveSettingsOption = (key,value="") => {
        let {usersettings} = this.state;
        usersettings[key] = value;
        this.setMazafuckinState({usersettings:usersettings});
        if(value==="") localStorage.removeItem(key);
        else localStorage.setItem(key,value);
    }*/

    updateSetting = (key, val) => {
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
                return (<Cell onCheckerClick={this.onCheckerClick} x={x} y={y} key={k} k={k} checker={checker} damka={damka} color={color} active={active} variable={possibilities} />);
            });
        }

        let fieldClass = this.state.isLoading?"loading":"";

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
                <div className="uchecker black" id="stepper"><i className="fa fa-chess-queen"></i>&nbsp;</div>
                <div className="umaincon animate__fadeInRight animate__animated">
                    <div className={fieldClass} id="ufield" style={{backgroundImage: Board, transform: this.state.playerInfo.color === "white" ? "rotate(0deg)" : "rotate(180deg)"}}>
                    {renderedField}
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
