import React, { Component } from 'react';

import {
    Route,
    Switch,
    Redirect,
    withRouter
} from "react-router-dom";

import Corners from "./Components/Gameslogic/corners";
import Checkers from "./Components/Gameslogic/checkers";

class App extends Component{

    render() {
        const { history } = this.props
  
        return (
            <Switch>
                <Route history={history} path='/checkers' component={Checkers} />
                <Route history={history} path='/corners' component={Corners} />
                <Redirect from='/' to='/checkers'/>
            </Switch>
        );
    }

}

export default withRouter(App);