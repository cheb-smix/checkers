import "./index.css";
import React from 'react';
export default class RoundProgressBar extends React.Component{

    timeout     = this.props.timeout ? this.props.timeout : 300;
    perc        = this.props.perc ? this.props.perc : 0;
    initPerc    = this.props.initPerc ? this.props.initPerc : 0;
    index       = this.props.index ? this.props.index : 0;
    id          = this.props.id ? this.props.id : `RPB${this.index}`;

    progressView = (current = false) => {   
        setTimeout(() => {
            document.querySelectorAll('.diagram').forEach((box, i) => {
                if (!current || box.id === this.props.id) {
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
                }
            });
        }, 50);
    }

    setInitPerc = (box) => {
        let deg = (360 * (this.initPerc > 200 ? 200 : this.initPerc) / 100) + 180;
        if (this.initPerc > 150) {
            box.classList.add('over_150');
        } else if (this.initPerc > 100) {
            box.classList.add('over_100');
        } else if (this.initPerc >= 50) {
            box.classList.add('over_50');
        } else {
            box.classList.remove('over_50');
            box.classList.remove('over_100');
            box.classList.remove('over_150');
        }
        box.querySelector('.piece.right').style.transform = 'rotate('+deg+'deg)';
    }

    setCurrentPerc = (box) => {
        setTimeout(() => {
            let deg = (360 * (this.perc > 200 ? 200 : this.perc) / 100) + 180;
            box.classList.add('shown');
            setTimeout(() => {
                if (this.perc > 150) {
                    box.classList.add('over_150');
                } else if (this.perc > 100) {
                    box.classList.add('over_100');
                } else if (this.perc >= 50) {
                    box.classList.add('over_50');
                } else {
                    box.classList.remove('over_50');
                    box.classList.remove('over_100');
                    box.classList.remove('over_150');
                }
                box.querySelector('.piece.right').style.transform = 'rotate('+deg+'deg)';
            }, 200);
        }, this.index * this.timeout);
    }

    componentDidMount = () => {
        setTimeout(() => {
            let box = document.getElementById(this.id);
                        
            if (box) {
                if (this.initPerc) this.setInitPerc(box);
                if (this.perc) this.setCurrentPerc(box);
            }
        }, 50);
        //this.progressView(true);
    }
    
    componentDidUpdate = () => {
        let box = document.getElementById(this.id);
        if (box && this.perc) this.setCurrentPerc(box);
    }

    render(){
        // if (this.props.last === 'true' && !this.props.intervalUpdate) this.progressView();
        let classes = 'diagram progress tooltip';
        if (this.props.theme) {
            classes += ` ${this.props.theme}`;
        }
        let number = this.perc;
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
        let styles = {};
        if (this.props.style) {
            for (let s in this.props.style) styles[s] = this.props.style[s];
        }
        if (this.props.size) {
            styles.width = this.props.size;
            styles.height = this.props.size;
        }
        return (
            <div id={this.id} className={classes} data-tooltip={this.props.tooltip} style={styles}>
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