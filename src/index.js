import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from "react-router-dom";
import {createBrowserHistory} from 'history';
import App from './App.js';

import 'font-awesome5/css/fontawesome-all.css';
import "animate.css/animate.css";

const history = createBrowserHistory();

Math.coefficient = (n1,n2,f=0) => {
  n2 = n2>0?n2:1;
  return (n1 / n2).toFixed(f);
}
Math.percent = (n1,n2,f=0) => {
  n2 = n2>0?n2:1;
  return (n1 * 100 / n2).toFixed(f)+"%";
}

ReactDOM.render(
  <Router history={history}>
    <App/>
  </Router>
  ,
  document.getElementById('root')
);
