import React from 'react';
import Noise from '../../Funcs/Noise';
import './slider.css';

export default class Slider extends React.Component{
    state = {
        value: this.props.value
    }

    setNewValue = (e) => {
        let offsetX = React.isset(e.nativeEvent.offsetX) ? e.nativeEvent.offsetX : e.clientX - ((document.body.offsetWidth - e.target.offsetWidth) / 2);
        offsetX = Math.round(offsetX * 100 / e.target.offsetWidth);

        if (offsetX > 95) offsetX = 100;
        if (offsetX < 5) offsetX = 0;
        this.setState({value: offsetX});
        this.props.onSet(this.props.id, offsetX);
        Noise("menu-click");
    }
    render(){
        return (
        <div className="slider" onClick={this.setNewValue}><div className="placeholder" val={Math.floor(this.state.value) + "%"}>{this.props.placeholder}</div><div className="val" style={{width: this.state.value + "%"}}></div></div>
        );
    }
}