import React from 'react';
import './checker.css';

export default class Checker extends React.Component{

    render(){
        const {checker,color,active} = this.props;
        let classNames = "uchecker "+color+(active?" active":"");
        if(checker==="userchecker") classNames += " userchecker";
        return (
            <div className={classNames} c={color} checker={checker} id={checker}>&nbsp;</div>
        );
    }
}