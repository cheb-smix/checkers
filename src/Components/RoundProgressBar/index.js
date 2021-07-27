import "./index.css";
import React from 'react';
export default class RoundProgressBar extends React.Component{

    timeout = React.isset(this.props.timeout) ? this.props.timeout : 300;

    progressView = () => {   
        setTimeout(() => {
            document.querySelectorAll('.diagram').forEach((box, i) => {
                setTimeout(() => {
                    let deg = (360 * (box.dataset.percent > 200 ? 200 : box.dataset.percent) / 100) + 180;
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
        let classes = 'diagram progress tooltip';
        if (this.props.forceColor) {
            classes += ' greendiagram';
        }
        let number = this.props.perc;
        if (React.isset(this.props.num)) {
            number = this.props.num;
            if (number - 0 > 0) {
                if (number > 99999) number = Math.pround(number / 1000, 1) + 'K';
                if (number > 999999) number = Math.pround(number / 1000000, 2) + 'M';
                if (number > 99999999) number = Math.pround(number / 1000000, 1) + 'M';
                if (number > 999999999) number = Math.pround(number / 1000000000, 1) + 'B';
            } else {
                if (`${number}`.length > 5) classes += ' hugetext';
            }
        }
        return (
            <div className={classes} data-tooltip={this.props.tooltip} data-percent={this.props.perc}>
                <div className="piece left"></div>
                <div className="piece right"></div>
                <div className="text">
                    <div>
                        <b>{number}</b>
                        <span>{this.props.text}</span>
                    </div>
                </div>
            </div>
        );
    }
}