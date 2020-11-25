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

class App extends Component{

    componentDidMount = () => {
        document.querySelector(".App-logo").style.top = "15vh";
    }

    render() {
        const { history } = this.props
  
        return (
            <Switch>
                <Route history={history} path='/home' component={Home} />
                <Route history={history} path='/checkers' component={Checkers} />
                <Route history={history} path='/corners' component={Corners} />
                <Redirect from='/' to='/home'/>
            </Switch>
        );
    }

}

export default withRouter(App);