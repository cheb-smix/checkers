import Lang from '../Components/Localization';

export default class Socket
{
    socketOpened = false;
    name = "";
    game = "checkers";
    dataRecieved = null;

    constructor(name, game = "checkers", dataRecieved)
    {
        console.log(`Connecting socket ${window.loft.wsserver}`);
        this.name = name;
        this.game = game;
        this.dataRecieved = dataRecieved;
        this.socket = new WebSocket(window.loft.wsserver);
        this.socket.onopen = () => {
            this.socketOpened = true;
            console.log("Connected to socket!");

            let regData = {
                action: "register",
                game: this.game,
                name: this.name,
            };

            if (Object.keys(window.loft.device) > 0) regData.aua = window.loft.device;
            if (window.loft.atoken) regData.atoken = window.loft.atoken;

            this.socketSend(regData);
        };
        this.socket.onclose = evt => { 
            if (evt.wasClean) {
                console.log(Lang("disconnected"));
            } else {
                console.log(Lang("serversUnavailable"));
            }
            this.socketOpened = false;
            console.log('Code: ' + evt.code + ' reason: ' + evt.reason);
        };
        this.socket.onerror = evt => { 
            console.log('Socket connection failed', evt);
            this.socketOpened = false;
        };
        this.socket.onmessage = evt => { 
            console.log(evt);
            this.dataRecieved(evt.data);
        };
    }

    continueWithSameOpponent = () => {
        if(this.socketOpened) this.socketSend({action:"REREGISTER"});
        //else this.consoleLog(Lang("serversUnavailable"));
        //this.clearPlayerInfoAfterGameOver();
    }

    searchNewOpponent = (reset = true) => {
        let regdata = {
            action:"REGISTER",
            game: this.game,
            name: this.name,
        };
        //if(typeof(this.state.playerInfo.login)!=="undefined") regdata['login'] = this.state.playerInfo.login;
        if(this.socketOpened) this.socketSend(regdata);
        //else this.consoleLog(Lang("serversUnavailable"));
        //if(reset) this.clearPlayerInfoAfterGameOver();
    }

    /*suggestNewOneGame = (text = "") => {
        window.loft.showModal(
            <div>
                <Button action={()=>this.clearPlayerInfoAfterGameOver()} href="" value={Lang("noText")} />
                <Button action={()=>this.searchNewOpponent()} href="" value={Lang("yesText")} />
            </div>,
            text + "<br />" + Lang("findAnewGame")
        );
    }*/

    quit = (suggestNewOne = true, juststopsearching = true) => {
        if(this.socketOpened) this.socketSend({action:"QUIT"});
        //else this.consoleLog(Lang("serversUnavailable"));
        if(suggestNewOne) this.suggestNewOneGame();
        //else if(juststopsearching) this.clearPlayerInfoAfterGameOver();
    }

    startNewSearch = () => {
        this.searchNewOpponent(false);
    }

    stopTheSearch = () => {
        this.quit(false,false);
    }


    socketReplyProcessing(response){
        response = JSON.parse(response.data);
        let data = response.data;
        if(typeof(data.serverInfo) !== "undefined"){
            this.setMazafuckinState({serverInfo: data.serverInfo});
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
            let colorInfo = Lang(`${data.players[this.state.playerInfo.token].color}IsYours`);
            let newStateObject = {
                playersStep: playersStep,
                lastStep: data.lastStep,
                lastStepTime: data.lastStepTime,
                opponentInfo: data.players[data.players[this.state.playerInfo.token].opponent],
                playerInfo: data.players[this.state.playerInfo.token],
                consoleText: (playersStep ? Lang("yourTurnText") : Lang("enemyTurnText"))+colorInfo,
                online: true,
                cells: this.dropCheckersToDefaults(),
                searchingOnlineOpponent: false,
                searchingOnlineCounter: 0,
                timeoutCheckInterval: setInterval(()=>{
                    if(this.state.online && this.state.playerInfo.status === "in_game" && this.state.lastStepTime>0){
                        let r = Math.floor(new Date().getTime() / 1000) - this.state.lastStepTime;
                        if(r > window.loft.config.StepTimeLimit * 2 / 3){
                            this.consoleLog((this.state.playersStep ? Lang("yourTurnText") : Lang("enemyTurnText"))+(window.loft.config.StepTimeLimit - r));
                        }
                        if(r > window.loft.config.StepTimeLimit){
                            if(!this.state.playersStep){
                                this.socketSend({action:"TIMEOUTOPPO"});
                                this.suggestNewOneGame(Lang("enemyLostByTimeout"));
                            }
                            this.consoleLog(Lang("gameOverByTimeout"));
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
        if(response.response==="GAMEOVER"){
            if(response.data.reason === "OPPOTIMEOUT"){
                clearInterval(this.state.timeoutCheckInterval);
                this.setMazafuckinState({
                    timeoutCheckInterval: false,
                    online: false,
                    consoleText: Lang("enemyLostByTimeout")
                });
            }
            if(response.data.reason === "TIMEOUT"){
                clearInterval(this.state.timeoutCheckInterval);
                this.setMazafuckinState({
                    timeoutCheckInterval: false,
                    online: false,
                    consoleText: Lang("youveLostByTimeout")
                });
            }
        }
        this.consoleLog(response.response);
    }


    socketSend = (param) => {
        console.log(param);
        this.socket.send(JSON.stringify(param));
    }

}