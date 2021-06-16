import React, { Component } from 'react';
import {
    Route,
    Switch,
    Redirect,
    withRouter
} from "react-router-dom";

import Home from "./Components/Home";
import Setting from './Components/Setting';

import Corners from "./Components/Gameslogic/corners";
import Checkers from "./Components/Gameslogic/checkers";

import './Funcs/fps';
import Modal from './Components/Modal';
import Noise from './Funcs/Noise';
import './basic.css';

window.gvar = [
    'checkers', 
    'corners',
];


class App extends Component{

    state = {
        playlist: [
            //"music/sadness_and_hate.mp3",
            //"music/hidden_inside.mp3",
            //"music/liricue.mp3",
            //"music/road_begins.mp3",
        ],
        modal: {
            code: "", header: "", bg: true, panel: true, autoclose: false
        },
        language: "en",
        isGuest: window.loft.isGuest,
    }

    hideModal = () => {
        Noise("menu-click");
        let a = document.querySelectorAll(".show");
        for(let i=0;i<a.length;i++) a[i].className = a[i].className.replace("show","");
        setTimeout(()=>{
            this.setState({modal: {code: "", header: "", bg: true, panel: true, autoclose: false}});
        },300);
    }

    showModal = (code = "", header = "", bg = true, panel = true, autoclose = false) => {
        if (code === false) {
            this.hideModal();
            return;
        }
        this.setState({modal: {code: code, header: header, bg: bg, panel: panel, autoclose: autoclose}});
    }

    setNewTrack = () => {
        
        let musicplayer = document.querySelector("#musicplayer");
        if (!this.state.playlist || musicplayer.volume === 0) return;
        
        let r = Math.floor(Math.random() * this.state.playlist.length);
        let c = 0;
        while (musicplayer.src === this.state.playlist[r] && c < 5) {
            r = Math.floor(Math.random() * this.state.playlist.length);
            c++;
        }
        setTimeout(() => {
            musicplayer.src = this.state.playlist[r];
        }, 500);
        
    }

    setAppState = (o = {}) => {
        this.setState(o);
    }

    componentDidMount = () => {
        document.querySelector("#musicplayer").volume = window.loft.usersettings.musicvolume / 100;
        this.setNewTrack();
        document.querySelector("#musicplayer").addEventListener("ended", this.setNewTrack);
        document.querySelector(".App-logo").style.top = "15vh";

        if (window.cordova) {
            alert('main app');
            window.loft.removeAllListeners(document, "backbutton");
            window.loft.addListener(document, "backbutton", () => {
                alert(document.location.href);
                // this.hideModal();
                // if (document.location.href.indexOf('home') > 0) navigator.app.exitApp();
                // else navigator.app.backHistory();
            }, false);
        }
        window.loft.showModal = this.showModal;
        window.loft.nextTrack = this.setNewTrack;
        window.loft.musicEnabled = this.state.playlist.length > 0;

        window.loft.localization.setStater(this.setAppState);
    }

    render() { 
        return (
            <React.Fragment>
                <Switch>
                    <Route path='/home' render={(props) => <Home {...props} setAppState={this.setAppState} isGuest={this.state.isGuest} />} />

                    {
                    <Route   path='/checkers' render={(props) => <Checkers {...props} setAppState={this.setAppState} isGuest={this.state.isGuest} />} />
                    }
                    {
                    <Route   path='/corners' render={(props) => <Corners {...props} setAppState={this.setAppState} isGuest={this.state.isGuest} />} />
                    }
                    
                    <Route path='/settings' render={(props) => <Setting {...props} modal={false} />} />
                    <Redirect from='/' to='/home'/>
                </Switch>
                <Modal closer={this.hideModal} modal={this.state.modal}/>
            </React.Fragment>
        );
    }

}

export default withRouter(App);