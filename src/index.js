import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from "react-router-dom";
import {createBrowserHistory, createHashHistory} from 'history';
import App from './App.js';

import './FontAwesome.css';
import "animate.css/animate.css";
import Settings from './Components/Setting/settings';
import postData from './Funcs/PostDataFuncs';
import './Funcs/Math';
import './Funcs/Addons';
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
        EpicStepNum: {
            checkers: 3,
            giveaway: 3,
            corners: 4
        },
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
    user_info: {
        id: 0,
        username: "guest",
        display_name: "Guest",
        coins: 0,
        stat: {
            total_games:  0,
            total_wins:   0,
            total_failes: 0,
            total_draws:  0,
            total_steps:  0,
            total_hops:   0,
            total_kills:  0,
            experience:   0,
            level:        1
        },
        lastGameStat: {
            kills: 0,
            steps: 0,
            hops: 0,
            points: 0,
            coins: 0,
            time: 0,
            level: 1,
        }
    },
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
    chart: {},
};

if (!window.cordova && ["localhost", "192.168.31.168", "127.0.0.1", ""].indexOf(window.location.hostname) >= 0) {
    window.loft.wsserver = "ws://192.168.31.168:1988";
    window.loft.apiserver = "http://192.168.31.168/game/";
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
    console.log("Using", window.loft.apiserver);
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

    if (["none", "unknown"].indexOf(window.loft.connectionType) >= 0) return;

    let res = await postData({url: window.loft.apiserver + "config"});
    
    if (res) {
        for (let k in res.config) window.loft.config[k] = res.config[k];
        for (let k in res.serverInfo) window.loft.serverInfo[k] = res.serverInfo[k];
        for (let k in res.user_info) window.loft.user_info[k] = res.user_info[k];
        window.loft.isGuest = res.isGuest;
        window.loft.AjaxAvailable = true;
        // window.loft.devInfo = res.devInfo;
        window.loft.device = res.device;

        window.loft.settings.set("config", res.config, 3600 * 24 * 3);
        window.loft.settings.set("user_info", res.user_info, 3600 * 24);
        window.loft.settings.set("serverInfo", res.serverInfo, 360);

        if (!React.empty(res.chart)) {
            window.loft.chart.length = 0;
            for (let k in res.chart) {
                if (!React.isset(window.loft.chart[k])) window.loft.chart[k] = {};
                for (let d in res.chart[k]) {
                    window.loft.chart[k][d] = res.chart[k][d];
                }
                window.loft.chart.length = Object.keys(window.loft.chart[k]).length;
            }
            window.loft.settings.set("chart", res.chart, 3600 * 20);
        }

    } else {
        let localsetts = ["config", "user_info", "serverInfo", "chart"];
        for (let i in localsetts) {
            let ls = window.loft.settings.get(localsetts[i]);
            if (ls) {
                for (let k in ls) window.loft[localsetts[i]][k] = ls[k];
            }
        }
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