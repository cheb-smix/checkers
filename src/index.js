import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from "react-router-dom";
import {createBrowserHistory, createHashHistory} from 'history';
import App from './App.js';

import './FontAwesome.css';
import "animate.css/animate.css";
import { Settings } from './Components/Setting/index.js';
import postData from './Funcs/PostDataFuncs';

window.loft = {
    wsserver: "wss://ws.smix-soft.ru:8080",
    apiserver: "https://smix-soft.ru/api/v2/game/",
    settings: new Settings(),
    device: {},
    devInfo: {},
    history: window.cordova ? createHashHistory() : createBrowserHistory(),
    sounds: {},
    musicEnabled: false,
    config: { 
        WriteSteps: false, 
        WriteStats: false, 
        Debug: false,
        StepTimeLimit: 30,
        AnimationSpeed: 45,
        EpicStepNum: 4,
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
    _eventHandlers: {},
    user_info: {},
    serverInfo: {},
    atoken: localStorage.getItem("atoken"),
    isGuest: true,
    AjaxAvailable: null,
    socket: null,
};

if (["localhost", "192.168.31.168", "127.0.0.1", ""].indexOf(window.location.hostname) >= 0) {
    window.loft.wsserver = "ws://192.168.31.168:1988";
    window.loft.apiserver = "http://192.168.31.168:3333/game/";
}

window.loft.usersettings = window.loft.settings.getSettings();
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
    console.log(window.loft);
    DOMLoaded();
}

async function checkConnection()
{
    if (typeof(navigator.connection) !== "undefined") {
        window.loft.connectionType = typeof(navigator.connection.type) === "undefined" ? navigator.connection.effectiveType : navigator.connection.type;
    } else {
        window.loft.connectionType = "unknown";
    }
    let res = await postData({url: window.loft.apiserver + "config"});
    
    if (res) {
        window.loft.config = res.config;
        window.loft.user_info = res.user_info;
        window.loft.isGuest = res.isGuest;
        window.loft.AjaxAvailable = true;
        window.loft.devInfo = res.devInfo;
        window.loft.serverInfo = res.serverInfo;
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


