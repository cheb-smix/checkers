import React, { Component } from 'react';

import "./Components/Gameslogic/ugolki";

import {
    Route,
    Switch,
    Redirect,
    withRouter
} from "react-router-dom";

class App extends Component{

    render() {
        const { history } = this.props
  
        return (
            <Switch>
                <Route history={history} path='/ugolki' component={Ugolki} />
                <Redirect from='/' to='/ugolki'/>
            </Switch>
        );
    }

}

export default withRouter(App);