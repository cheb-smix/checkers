import "./rampage.css";
import React from 'react';
export default class Rampage extends React.Component {
    render() {
        const words = ["LOOSER", "NOT BAD", "COOL", "AWESOME", "UNBELIEVABLE", "INCREDIBLE", "RAGE", "FURY", "RAMPAGE", "INSANITY"];

        let word = "AWESOME";
        if (this.props.hops < words.length) word = words[this.props.hops];
        else word = words[words.length - 1];

        let delayexp = this.props.hops * 5;
        let classNames = this.props.hops >= words.length - 2 ? "glitch" : "redtext";

        if (this.props.hops === 0) {
            word = this.props.word;
            classNames = "glitch";
        }

        let renderedField = '';
        let i = 0;
        let fs = 5 + (10 - word.length) / 10 * 1.5 + "vmin";

        if (classNames === "glitch") {
            fs = Math.round(80 / word.length) + "vmin";
        } else {
            if (this.props.hops > words.length / 2) {
                renderedField = word.split("").map((ch) => {
                    i += delayexp;
                    let key = "char" + i;
                    return (<h1 key={key} style={{ animationDelay: i + 'ms', display: "inline-block" }}>{ch}</h1>);
                });
            } else {
                renderedField = <h1>{word}</h1>;
            }
        }

        if (classNames === "glitch") {
            return (
                <div className="container"><div className="con2"><h1 className="glitch" data-text={word} style={{ fontSize: fs }}>{word}</h1></div></div>
            );
        } else {
            return (
                <div className={classNames} data-text={word} style={{ fontSize: fs }}>{renderedField}</div>
            );
        }
    };
}