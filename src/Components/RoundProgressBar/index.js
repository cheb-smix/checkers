import "./index.css";
import React from 'react';
export default class RoundProgressBar extends React.Component{

    timeout = React.isset(this.props.timeout) ? this.props.timeout : 300;

    progressView = () => {   
        setTimeout(() => {
            document.querySelectorAll('.diagram').forEach((box, i) => {
                setTimeout(() => {
                    let deg = (360 * box.dataset.percent / 100) + 180;
                    box.classList.add('shown');
                    setTimeout(() => {
                        if (box.dataset.percent > 150) {
                            box.classList.add('over_150');
                        } else if (box.dataset.percent > 100) {
                            box.classList.add('over_100');
                        } else if (box.dataset.percent >= 50) {
                            box.classList.add('over_50');
                        } else {
                            box.classList.remove('over_50');
                            box.classList.remove('over_100');
                            box.classList.remove('over_150');
                        }
                        box.querySelector('.piece.right').style.transform = 'rotate('+deg+'deg)';
                    }, 200);
                }, i * this.timeout);
            });
        }, 50);
    }

    render(){
        if (this.props.last === 'true') this.progressView();
        return (
            <div className="diagram progress tooltip" data-tooltip={this.props.tooltip} data-percent={this.props.perc}>
                <div className="piece left"></div>
                <div className="piece right"></div>
                <div className="text">
                    <div>
                        <b>{React.isset(this.props.num) ? this.props.num : this.props.perc}</b>
                        <span>{this.props.text}</span>
                    </div>
                </div>
            </div>
        );
    }
}