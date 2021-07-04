import React from 'react';
import Lang from '../Localization';
import './console.css';

export default class Console extends React.Component{

    state = {
        isMobile: (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)),
    }

    render(){
        let consoleClassName = "console neonconsole";
        
        if(this.state.isMobile) consoleClassName = "console altneonconsole";
        
        let avgtime = window.loft.serverInfo.avgwaittime.avg;
        if(avgtime === 0){
            avgtime = "∞";
        }
        let serverInfo = <span></span>;
        if(this.props.searching){
            serverInfo = <span>{Lang("searchingTheEnemy")} {this.props.count}<br />{Lang("approxWaitTime").replace("$", avgtime)}<br />{Lang("playersOnServers").replace("$", window.loft.serverInfo.playersstat.total)}<br />{Lang("playersInSearch").replace("$", window.loft.serverInfo.playersstat.searching)}</span>
        }
        let consoleText = this.props.rampageCode === "" ? this.props.text : "";
        let writeStepsBlock = "";
        if(window.loft.config.WriteSteps) writeStepsBlock = <span className="offlinespan oswithfa"> rec</span>;
        return (
            <div id="consoleParentino">
            <div className={consoleClassName} data-text={this.props.text}><p>{consoleText}</p></div>
            <table><tbody><tr>
                <td id="avgtime">{serverInfo}</td>
                <td id="playerName">
                    <span className="onlinespan" style={{fontSize: "1.5em"}}>{this.props.player}</span><br />vs<br />{this.props.opponent}<br />
                    <span className={this.props.online?"onlinespan oswithfa":"offlinespan oswithfa"}>{this.props.online?"online":"offline"}</span>
                    {writeStepsBlock!==""?<br/>:""}
                    {writeStepsBlock}
                </td>
                <td id="fps" style={{display: window.loft.config.Debug ? "block" : "none" }}></td>
            </tr></tbody></table>
            <div id="rampageContainer">{this.props.rampageCode}</div>
            </div>
        );
    }
}