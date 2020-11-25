import React from 'react';

import "./button.css";

export default class Button extends React.Component{

    buttonAction = () => {
        if (this.props.action !== "") {
            console.log(this.props.action);
            this.props.action();
        }
        if (this.props.href !== "") {
                
            let a = document.querySelector("#utitle");
            if (a) a.className  = "animate__rotateOutUpLeft animate__animated fa-2x";

            a = document.querySelector(".umaincon");
            if (a) a.className = "umaincon animate__fadeOutLeft animate__animated";

            a = document.querySelector("#homeButtons");
            if (a) a.className = "animate__fadeOut animate__animated";

            setTimeout(() => {
                this.props.history.push(this.props.href);
            }, 1000);
        }
    }

    render(){
        return (
            <div onClick={this.buttonAction} className="ubutton">{this.props.value}</div>
        );
    }
}