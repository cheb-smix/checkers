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
import Setting from './Components/Setting';
import Settings from './Funcs/settings';

class App extends Component{

    state = {
        settings: new Settings(),
        playlist: [
            "/music/sadness_and_hate.mp3",
        ]
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
        
        console.log("set new track",musicplayer.src);
        //musicplayer.play();
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
            <Switch>
                <Route history={history} path='/home' component={Home} />
                <Route history={history} path='/checkers' component={Checkers} />
                <Route history={history} path='/corners' component={Corners} />
                <Route history={history} path='/settings' component={Setting} />
                <Redirect from='/' to='/home'/>
            </Switch>
        );
    }

}

export default withRouter(App);