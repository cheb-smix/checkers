import React from 'react';
import Noise from '../../Funcs/Noise';
import Routing from '../../Funcs/Routing';

import "./button.css";

export default class Button extends React.Component{

    buttonAction = () => {
        Noise("menu-click");
        if (this.props.action !== "") {
            console.log("ACTION!");
            this.props.action();
        }
        if (this.props.href !== "") Routing(this.props.href);
    }

    render(){
        let className = "ubutton" + (this.props.theme ? " " + this.props.theme : " maintheme");
        if (this.props.strong) className += " strong";
        return (
            <div onClick={this.buttonAction} className={className}>{this.props.value}</div>
        );
    }
}