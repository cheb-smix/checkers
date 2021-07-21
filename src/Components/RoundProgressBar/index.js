import "./index.css";
import React from 'react';
export default class RoundProgressBar extends React.Component{

    progressView = () => {
        setTimeout(() => {
            let diagramBox = document.querySelectorAll('.RPB');
            diagramBox.forEach((box) => {
                let deg = (360 * box.dataset.percent / 100) + 180;
                if(box.dataset.percent >= 50){
                    box.classList.add('over_50');
                }else{
                    box.classList.remove('over_50');
                }
                box.querySelector('.piece.right').style.transform = 'rotate('+deg+'deg)';
            });
        },100);
    }

    render(){
        //this.progressView();
        return (
            <div className="diagram progress" data-percent="98">
                <div className="piece left"></div>
                <div className="piece right"></div>
                <div className="text">
                    <div>
                        <b>33</b>
                        <span>PERCENT</span>
                    </div>
                </div>
            </div>
        );
    }
}