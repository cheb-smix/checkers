import React from 'react';
import "./fanfara.css";

export default class Fanfara extends React.Component{

    state = {
        animated: false
    }

    animate = () => {
        if(typeof(this.props.playerInfo.login)==="undefined" || this.props.playerInfo.status==="in_game" || this.state.animated) return;

        this.props.XMLHR({action:"getPlayerStat",login:this.props.playerInfo.login},(data)=>{
            this.setState({animated:true});
            if(data.success){
                //data.data.lvl++;
                //data.data.exp = parseInt(data.data.exp,10)+1850;
                let pdiv = document.querySelector(".progress");
                let newLVL = data.data.lvl;
                let curLVL = this.props.playerInfo.statistics.lvl;
                let lvlDIF = newLVL - curLVL;
                let newEXP = data.data.exp;
                let expDIF = newEXP - this.props.playerInfo.statistics.exp;

                document.getElementById("fantext").innerHTML = document.getElementById("fantext").innerHTML+"<br>Вы "+(expDIF<0?"потеряли ":"получили ")+Math.abs(expDIF)+" опыта!";
                if(lvlDIF>0){
                    let s = setInterval(()=>{
                        if(lvlDIF>0){
                            pdiv.style.transition = "all 0.5s ease";
                            pdiv.style.width = "100%";
                            pdiv.style.left = "0%";
                            lvlDIF--;
                            curLVL++;
                            setTimeout(()=>{
                                let startexp = (curLVL > 1) ? (50*(Math.pow(2,curLVL-1))) : 0;
                                let endexp = 50*(Math.pow(2,curLVL));
                                document.querySelector(".stable td:nth-child(1)").innerHTML = startexp;
                                document.querySelector(".stable td:nth-child(2)").innerHTML = endexp;
                                document.querySelector(".exp").className = 'exp tada animated';
                                pdiv.style.transition = "none";
                                pdiv.style.width = "0%";
                                pdiv.style.left = "50%";
                                setTimeout(()=>{
                                    pdiv.style.transition = "all 0.5s ease";
                                },30);
                            },500);
                        }else{
                            let startexp = (newLVL > 1) ? (50*(Math.pow(2,newLVL-1))) : 0;
                            let endexp = 50*(Math.pow(2,newLVL));
                            let progress = Math.percent(newEXP - startexp,endexp - startexp);
                            pdiv.style.width = progress;
                            pdiv.style.left = (50 - parseInt(progress,10)/2)+"%";
                            this.props.rampage(0,"NEW LEVEL "+newLVL+"!");
                            pdiv.innerHTML = newEXP;
                            clearInterval(s);
                            this.props.updatePI(data.data);
                        }
                    },600)
                }else{
                    let startexp = (curLVL > 1) ? (50*(Math.pow(2,curLVL-1))) : 0;
                    let endexp = 50*(Math.pow(2,curLVL));
                    let progress = Math.percent(newEXP - startexp,endexp - startexp);
                    pdiv.style.width = progress;
                    pdiv.style.left = (50 - parseInt(progress,10)/2)+"%";
                    pdiv.innerHTML = newEXP;
                    this.props.updatePI(data.data);
                }
                this.props.showBestMove();
            }
        });
    }

    componentDidMount = () => {
        let f = document.getElementById("fanfara");
        let u = document.getElementById("ufield");
        f.style.top = u.offsetTop+"px";
        f.style.left = u.offsetLeft+"px";
    }

    render(){        
        let {playerInfo,opponentInfo} = this.props;
        let header = "";
        let text = <p></p>;
        let podtext = "";
        /**/
        //playerInfo.done = 12;
        //playerInfo.status = "winner";
        //opponentInfo.done = 3;
        //opponentInfo.status = "looser";
        /**/
        let playersCheckersUnDone = 12 - playerInfo.done;
        let opponentCheckersUnDone = 12 - opponentInfo.done;
        let ppercent = Math.round(playersCheckersUnDone*100/12);
        let opercent =  Math.round(opponentCheckersUnDone*100/12);

        let buttons = 
            <div className="container" style={{height:"auto"}}>
                <div className="row">
                    <div className="col-12">
                        <div className="sbtn grey-sbtn" onClick={()=>{this.props.quit(false)}}>Закрыть</div>
                    </div>
                    <div className="col-12">
                        <div className="sbtn grey-sbtn" onClick={this.props.continueWithSameOpponent}>{"Продолжить с "+opponentInfo.name}</div>
                    </div>
                    <div className="col-12">
                        <div className="sbtn grey-sbtn" onClick={this.props.searchNewOpponent}>Найти другого противника</div>
                    </div>
                </div>
            </div>;

        let gonnashow = false;

        if(playerInfo.status!=="winner" && playerInfo.status!=="looser" && playerInfo.status!=="done") playerInfo.status = "in_game";

        if(playerInfo.status==="winner" && playerInfo.done === 12){
            header = "Поздравляем!";
            podtext = "Вы отмудохали противника с отрывом";
            if(opponentCheckersUnDone===1) podtext += " всего на одну шашку";
            if(opponentCheckersUnDone>1 && opponentCheckersUnDone<5) podtext += " в "+opponentCheckersUnDone+" шашки";
            if(opponentCheckersUnDone>4) podtext += " аж на "+opponentCheckersUnDone+" шашек";
            podtext += " ("+opercent+"%)!";
            gonnashow = true;
        }
        if(playerInfo.status==="looser" && opponentInfo.done === 12){
            header = "Сожалеем";
            podtext = "Вы проиграли в этой партии, отстав";
            if(playersCheckersUnDone===1) podtext += " всего на одну шашку";
            if(playersCheckersUnDone>1 && playersCheckersUnDone<5) podtext += " на "+playersCheckersUnDone+" шашки";
            if(playersCheckersUnDone>4) podtext += " на целых "+playersCheckersUnDone+" шашек";
            podtext += " ("+ppercent+"%)!";
            gonnashow = true;
        }
        if(playerInfo.status==="done" && opponentInfo.status==="done" && playerInfo.done === 12 && opponentInfo.done === 12){
            header = "Неплохо!";
            podtext = "Ничья лучше проигрыша!";
            gonnashow = true;
        }
        if(playerInfo.status==="done" && opponentInfo.status!=="done" && playerInfo.done === 12){
            header = "Поздравляем!";
            text = <p>Вы почти выиграли! Ожидаем решающий ход противника.</p>
        }else{
            text = <React.Fragment><p id="fantext">{podtext}</p>{buttons}</React.Fragment>;
        }
        let expdiv = '';
        if(gonnashow && typeof(playerInfo.statistics)!=="undefined"){
            let {statistics:s} = playerInfo;
            let startexp = (s.lvl > 1) ? (50*(Math.pow(2,s.lvl-1))) : 0;
            let endexp = 50*(Math.pow(2,s.lvl));
            let progress = Math.percent(s.exp - startexp,endexp - startexp);
            let left = 50 - parseInt(progress,10)/2;
            if(this.state.animated===false) setTimeout(()=>{this.animate()},1000);
            expdiv = <div className="exp">
                <div className="progress" style={{width: progress, left: left+"%"}}>{s.exp}</div>
                <table className="stable" style={{padding: "0px"}}><tbody><tr><td>{startexp}</td><td>{endexp}</td></tr></tbody></table>
            </div>;
        }
        return (
            <div className={playerInfo.status} id="fanfara"><br/>
                <h3>{header}<br/>{playerInfo.name}<br/></h3>
                {expdiv}
                {text}
            </div>
        );
    }
}