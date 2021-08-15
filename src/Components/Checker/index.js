import React from 'react';
import './checker.css';

export default class Checker extends React.Component{

    render(){
        const {checker,color,active,damka} = this.props;
        let classNames = "uchecker "+color+(active?" active":"");
        if (checker === "userchecker") classNames += " userchecker";
        if (damka) classNames += " damka";
        return (
            <div className={classNames} c={color} checker={checker} id={"checker" + checker}>&nbsp;</div>
        );
    }
}