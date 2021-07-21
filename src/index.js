import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from "react-router-dom";
import {createBrowserHistory, createHashHistory} from 'history';
import App from './App.js';

import './FontAwesome.css';
import "animate.css/animate.css";
import Settings from './Components/Setting/settings';
import postData from './Funcs/PostDataFuncs';
import { Localization } from './Components/Localization';

window.loft = {
    wsserver: "wss://ws.smix-soft.ru:8080",
    apiserver: "https://smix-soft.ru/api/v2/game/",
    settings: new Settings(),
    localization: null,
    device: {},
    devInfo: {},
    history: window.cordova ? createHashHistory() : createBrowserHistory(),
    sounds: {},
    musicEnabled: false,
    config: { 
        WriteSteps: false, 
        Debug: false,
        StepTimeLimit: 30,
        AnimationSpeed: 45,
        EpicStepNum: 4,
        BASE: 2,
        MLTPLR: 150,
        INC: 0.3
    },
    constants: {
        STATUS_ACTIVE  : "A",
        STATUS_FINISHED: "F",
        STATUS_NOMANS  : "N",
        STATUS_IN_GAME : "A",
        STATUS_DONE    : "D",
        STATUS_FAIL    : "F",
        STATUS_WON     : "W",
        STATUS_DRAW    : "X",
    },
    //timezoneOffset: new Date().getTimezoneOffset(),
    connectionType: "unknown",
    _eventHandlers: {},
    user_info: {},
    serverInfo: {
        avgwaittime: {cnt: 0, ttl: 0, avg: 0},
        playersstat: {total: 0, searching: 0, in_game: 0},
        gameavgstat: {hops: 0, steps: 0, time: 0, kills: 0, losses: 0}
    },
    atoken: localStorage.getItem("atoken"),
    isGuest: true,
    AjaxAvailable: null,
    socket: null,
    reqtype: "xhr",
};

if (!window.cordova && ["localhost", "192.168.31.168", "127.0.0.1", ""].indexOf(window.location.hostname) >= 0) {
    window.loft.wsserver = "ws://192.168.31.168:1988";
    window.loft.apiserver = "http://192.168.31.168:3333/game/";
}

window.loft.usersettings = window.loft.settings.getSettings();
window.loft.localization = new Localization();
window.loft.isCheckers = ["checkers", "giveaway"].indexOf(window.loft.usersettings.game) >= 0;

window.loft.addListener = (node, event, handler, capture = false) => {
    if (!(event in window.loft._eventHandlers)) {
        window.loft._eventHandlers[event] = [];
    }
    
    window.loft._eventHandlers[event].push({ node: node, handler: handler, capture: capture });
    node.addEventListener(event, handler, capture);
}

window.loft.removeAllListeners = (targetNode, event) => {
    if (!(event in window.loft._eventHandlers)) {
        return;
    }
    window.loft._eventHandlers[event]
      .filter(({ node }) => node === targetNode)
      .forEach(({ node, handler, capture }) => node.removeEventListener(event, handler, capture));
  
    window.loft._eventHandlers[event] = window.loft._eventHandlers[event].filter(
      ({ node }) => node !== targetNode
    );
}

if (window.cordova) {
    document.addEventListener("deviceready", onDeviceReady, false);
} else {
    document.addEventListener("DOMContentLoaded", DOMLoaded, false);
} 

async function DOMLoaded()
{
    document.getElementById("version").style.display = 'block';
    document.getElementById("version").innerHTML = window.loft.apiserver + '<br>' + document.getElementById("version").innerHTML;
    await checkConnection();
    ReactDOM.render(
        <Router history={window.loft.history}>
          <App/>
        </Router>
        ,
        document.getElementById('root')
    );
}

function onDeviceReady()
{
    window.screen.orientation.lock('portrait');
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("online", onOnline, false);
    document.addEventListener("offline", onOffline, false);
    window.loft.device = {};
    DOMLoaded();
}

async function checkConnection()
{
    if (typeof(navigator.connection) !== "undefined") {
        window.loft.connectionType = navigator.connection.type || navigator.connection.effectiveType;
    } 

    if (["none", "unknown"].indexOf(window.loft.connectionType) >= 0) {
        document.getElementById("version").innerHTML = 'Offline mode<br>' + document.getElementById("version").innerHTML;
        return;
    }

    let res = await postData({url: window.loft.apiserver + "config"});
    
    if (res) {
        for (let k in res.config) window.loft.config[k] = res.config[k];
        for (let k in res.serverInfo) window.loft.serverInfo[k] = res.serverInfo[k];
        window.loft.user_info = res.user_info;
        window.loft.isGuest = res.isGuest;
        window.loft.AjaxAvailable = true;
        window.loft.devInfo = res.devInfo;
        window.loft.settings.set("config", res.config);
        window.loft.settings.set("user_info", res.user_info);
        window.loft.settings.set("serverInfo", res.serverInfo);
    } else {
        let localsetts = ["config", "user_info", "serverInfo"]
        for (let i in localsetts) {
            let ls = window.loft.settings.get(localsetts[i]);
            if (ls) {
                ls = JSON.parse(ls);
                for (let k in ls) window.loft[localsetts[i]][k] = ls[k];
            }
        }
        document.getElementById("version").innerHTML = 'Offline mode<br>' + document.getElementById("version").innerHTML;
    }
}

async function onOnline()
{
    await checkConnection();
    //alert("Connection restored!");
}

function onOffline()
{
    window.loft.AjaxAvailable = false;
    //alert("Connection lost!");
}

function onPause() 
{
    document.querySelector("#musicplayer").pause();
}

function onResume() 
{
    if (document.querySelector("#musicplayer").volume > 0) document.querySelector("#musicplayer").play();
}

Math.coefficient = (n1,n2,f=0) => {
    n2 = n2>0?n2:1;
    return (n1 / n2).toFixed(f);
}

Math.percent = (n1,n2,f=0) => {
    n2 = n2>0?n2:1;
    return (n1 * 100 / n2).toFixed(f)+"%";
}

Math.diagonalEffectivity = (c1,c2,color="any",playstage = 1) => {
    let diagonalCorrection = 1;
    let dia1 = c1.x-c1.y;
    let dia2 = c2.x-c2.y;
    let dd = Math.abs(dia1 - dia2);
    if((dia1 > dia2 && color==="white") || ( dia1 < dia2 && color==="black")) diagonalCorrection = -1;
    if(dia1 === dia2) diagonalCorrection = playstage===3?1:0;
    let lessPriorityCellsCorrection = 1/(Math.abs(4.5-c2.x) * Math.abs(4.5-c2.y) / 4);
    lessPriorityCellsCorrection = 1;
    let hypotenuse = Math.pifagor(c1,c2);
    let p = (hypotenuse * lessPriorityCellsCorrection + dd) * diagonalCorrection;
    return {effectivity: p,dia1,dia2,dd,diagonalCorrection,lessPriorityCellsCorrection,hypotenuse};
}

Math.pifagor = (c1,c2) => {
    return Math.sqrt(Math.pow(c1.x - c2.x,2)+Math.pow(c1.y - c2.y,2));
}

Math.pifagorColored = (c1,c2,color="any") => {
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

Math.time = (timestamp, minlevel = 2) => {
    let level = 0;
    let del = 0;
    let levels = [60, 60, 24, 365];
    let result = [];
    while ((del = timestamp / levels[level]) > 0 || level < minlevel) {
        result.push(('0' + (timestamp % levels[level])).slice(-2));
        timestamp = Math.floor(del);
        level++;
    }
    return result.reverse().join(":");
}
