import React from 'react';

import Modal from '../Modal';
import Button from '../Button';
import Droplist from '../Droplist';

import './home.css';

// import './home.css';

export default class Home extends React.Component{

    render(){
        console.log(this.props);
        return (
            <div id="homeButtons" className="animate__fadeIn animate__animated">
                <Button action={this.props.GSS} href="/checkers" history={this.props.history} value="Против бота" />
                <Button action={this.props.GSS} href="/checkers" history={this.props.history} value="Локальная игра" />
                <Button action={this.props.GSS} href="/checkers" history={this.props.history} value="Онлайн" />
                <Button action="" href="/checkers" history={this.props.history} value="Войти" />
            </div>
        );
    };
}