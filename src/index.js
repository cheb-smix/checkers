import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from "react-router-dom"
import {createBrowserHistory} from 'history'
import App from './App.js';

import 'font-awesome5/css/fontawesome-all.css';
import "animate.css/animate.css";

const history = createBrowserHistory();
const server = window.location.hostname.length > 7 ? window.location.hostname : "smix-soft.ru";
const wsport = "8080";

ReactDOM.render(
  <Router history={history}>
    <App/>
  </Router>
  ,
  document.getElementById('root')
);
