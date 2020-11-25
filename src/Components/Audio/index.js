import React from 'react';

export default class Button extends React.Component{
    render(){
        return (
            <audio id={this.props.id} autoplay></audio>
        );
    }
}