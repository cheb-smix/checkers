import React from 'react';
import './checker.css';

export default class Checker extends React.Component{

    render(){
        const {checker,color,active,damka} = this.props;
        let classNames = "uchecker "+color+(active?" active":"");
        if (checker==="userchecker") classNames += " userchecker";
        if (damka) classNames += " damka";
        /*return (
            <div className={classNames} c={color} checker={checker} id={checker}>&nbsp;</div>
        );*/
        return (
            <div className={classNames} c={color} checker={checker} id={checker}><i className="fa fa-chess-queen"></i><i className="fa fa-crosshairs"></i>&nbsp;</div>
        );
        /*
        if (damka) {
            return (
                <div className={classNames} c={color} checker={checker} id={checker}><i class="fa fa-chess-queen"></i></div>
            );
        } else {
            return (
                <div className={classNames} c={color} checker={checker} id={checker}>&nbsp;</div>
            );
        }*/
    }
}