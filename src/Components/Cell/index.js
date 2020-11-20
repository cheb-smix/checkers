import React from 'react';
import './cell.css';
import Checker from '../Checker/';

export default class Cell extends React.Component{

    render(){
        const trnsp = [2,4,6,8,9,11,13,15,18,20,22,24,25,27,29,31,34,36,38,40,41,43,45,47,50,52,54,56,57,59,61,63];
        const {x,y,k,variable,checker,color,active,onCheckerClick,damka} = this.props;
        const p = JSON.stringify(variable);
        let classNames = "ucell"+(trnsp.indexOf(k)!==-1?" trnsp":"");
        const koords = x+":"+y;

        if(checker !== false){
            classNames += " withchecker";
            return (
                <div onClick={()=>onCheckerClick(koords)} koords={koords} className={classNames} x={x} y={y} k={k} variable={p}><Checker key={checker} k={k} color={color} checker={checker} active={active} damka={damka} /><div className="empty" >&nbsp;</div></div>
            );
        }else{
            return (
                <div onClick={()=>onCheckerClick(koords)} koords={koords} className={classNames} x={x} y={y} k={k}><div className="empty" >&nbsp;</div></div>
            );
        }
    }
}