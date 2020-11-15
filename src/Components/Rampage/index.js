import "./rampage.css";
import React from 'react';
export default class Rampage extends React.Component{
    render(){
        const words = ["LOOSER","NOT BAD","COOL","AWESOME","UNBELIEVABLE","INCREDIBLE","RAGE","FURY","RAMPAGE","INSANITY"];

        let word = "AWESOME";
        if(this.props.steps<words.length) word = words[this.props.steps];
        else word = words[words.length-1];
        
        let delayexp = this.props.steps * 5;
        let classNames = this.props.steps>=words.length-2?"glitch":"redtext";

        if(this.props.steps===0){
            word = this.props.word;
            classNames = "glitch";
        }

        let renderedField = '';
        let i = 0;
        let offs = 50;
        
        if(classNames === "glitch"){
            offs = 90;
        }else{
            if(this.props.steps > words.length/2){
                renderedField = word.split("").map((ch) => {
                    i += delayexp;
                    let key = "char"+i;
                    return (<h1 key={key} style={{animationDelay: i + 'ms', display: "inline-block"}}>{ch}</h1>);
                });
            }else{
                renderedField = <h1>{word}</h1>;
            }
        }
        let fs = Math.round(offs / word.length)+"vmin";

        if(classNames === "glitch"){
            return (
                <div className="container"><div className="con2"><h1 className="glitch" data-text={word} style={{fontSize: fs}}>{word}</h1></div></div>
            );
        }else{
            return (
                <div className={classNames} data-text={word} style={{fontSize: fs}}>{renderedField}</div>
            );
        }
    };
}