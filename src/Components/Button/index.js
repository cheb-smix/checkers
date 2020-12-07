import React from 'react';
import Routing from '../../Funcs/routing';

import "./button.css";

export default class Button extends React.Component{

    buttonAction = () => {
        if (this.props.action !== "") {
            this.props.action();
        }
        if (this.props.href !== "") Routing(this.props.href, this.props.history);
    }

    render(){
        let className = "ubutton" + (this.props.theme ? " " + this.props.theme : " maintheme");
        if (this.props.strong) className += " strong";
        return (
            <div onClick={this.buttonAction} className={className}>{this.props.value}</div>
        );
    }
}