import React, { Component } from 'react';

import {
    Route,
    Switch,
    Redirect,
    withRouter
} from "react-router-dom";

import Home from "./Components/Home";
import Corners from "./Components/Gameslogic/corners";
import Checkers from "./Components/Gameslogic/checkers";
import Setting, { Settings } from './Components/Setting';

import './Funcs/fps';
import Modal from './Components/Modal';

class App extends Component{

    state = {
        settings: new Settings(),
        playlist: [
            "/music/sadness_and_hate.mp3",
            "/music/hidden_inside.mp3",
            "/music/liricue.mp3",
            "/music/road_begins.mp3",
        ],
        modal: {
            code: "", header: "", bg: true, panel: true, autoclose: false
        },
        device: this.props.device
    }

    hideModal = () => {
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
        if (musicplayer.volume === 0) return;
        
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

    componentDidMount = () => {
        let usersettings = this.state.settings.getSettings();
        document.querySelector("#musicplayer").volume = usersettings.musicvolume / 100;
        document.querySelector("#soundplayer").volume = usersettings.soundvolume / 100;
        this.setNewTrack();
        document.querySelector("#musicplayer").addEventListener("ended", this.setNewTrack);
        document.querySelector(".App-logo").style.top = "15vh";
    }

    render() {
        const { history } = this.props
  
        return (
            <React.Fragment>
            <Switch>
                <Route history={history} path='/home' render={(props) => <Home {...props} {...this.props} showModal={this.showModal}/>} />
                <Route history={history} path='/checkers' render={(props) => <Checkers {...props} {...this.props} showModal={this.showModal}/>} />
                <Route history={history} path='/corners' render={(props) => <Corners {...props} {...this.props} showModal={this.showModal}/>} />
                <Route history={history} path='/settings' render={(props) => <Setting {...props} {...this.props} showModal={this.showModal}/>} />
                <Redirect from='/' to='/home'/>
            </Switch>
            <Modal closer={this.hideModal} modal={this.state.modal}/>
            </React.Fragment>
        );
    }

}

export default withRouter(App);