import React from 'react';
import ReactDOM from 'react-dom';

import { Router } from "react-router-dom";
import {createBrowserHistory, createHashHistory} from 'history';
import App from './App.js';

import 'font-awesome5/css/fontawesome-all.css';
import "animate.css/animate.css";

const history = window.cordova ? createHashHistory() : createBrowserHistory();

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
  //console.log("c1",c1.x,c1.y,"c2",c2,"dia",dia1,dia2,dd,diagonalCorrection,"pif",p);
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

ReactDOM.render(
  <Router history={history}>
    <App/>
  </Router>
  ,
  document.getElementById('root')
);
