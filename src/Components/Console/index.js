import React from 'react';
import './console.css';

export default class Console extends React.Component{

    state = {
        isMobile: (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }

    render(){
        let consoleClassName = "console neonconsole";
        
        if(this.state.isMobile) consoleClassName = "console glitch";
        
        let avgtime = this.props.serverInfo.avgwaittime['avg'];
        if(this.props.serverInfo.avgwaittime["cnt"]===0){
            avgtime = "∞";
        }
        let serverInfo = <span></span>;
        if(this.props.searching){
            serverInfo = <span>Поиск противника {this.props.count}<br />Примерное время ожидания: {avgtime} сек.<br />Игроков на сервере: {this.props.serverInfo.playersstat.total}<br />Игроков в поиске: {this.props.serverInfo.playersstat.searching}</span>
        }
        let consoleText = this.props.rampageCode === "" ? this.props.text : "";
        let writeStepsBlock = "";
        if(this.props.rec) writeStepsBlock = <span className="offlinespan oswithfa"> rec</span>;
        return (
            <div id="consoleParentino">
            <div className={consoleClassName} data-text={this.props.text}><div id="rampageContainer">{this.props.rampageCode}</div><p>{consoleText}</p></div>
            <table><tbody><tr>
                <td id="avgtime">{serverInfo}</td>
                <td id="playerName">
                    <span className="onlinespan" style={{fontSize: "1.5em"}}>{this.props.player}</span><br />vs<br />{this.props.opponent}<br />
                    <span className={this.props.online?"onlinespan oswithfa":"offlinespan oswithfa"}>{this.props.online?"online":"offline"}</span>
                    {writeStepsBlock!==""?<br/>:""}
                    {writeStepsBlock}
                </td>
                <td id="fps"></td>
            </tr></tbody></table>
            </div>
        );
    }
}