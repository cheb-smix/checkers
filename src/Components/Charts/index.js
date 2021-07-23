import "./index.css";
import React from 'react';

export default class Charts extends React.Component {
    height = this.props.height ? this.props.height : '10vh';
    legendColor = this.props.legendColor ? this.props.legendColor : '#1e6899';
    bgColor  = this.props.bgColor ? this.props.bgColor : '#053352';
    padding  = this.props.padding ? this.props.padding : '10% 5%';
    ymax;
    ymin;
    xmax;
    xmin;
    vsplit = 5;
    colors = [
        "blue", "green", "red"
    ];
    data = [
        {1: 0.25, 2: 0.5, 3: 0.75, 4: 0.88, 5: 0.45, 6: 0.66, 7: 0.45, 8: 0.99},
        {1: 0.35, 2: 0.12, 3: 0.7, 4: 0.8, 5: 0.5, 6: 0.6, 7: 0.1, 8: 0.1},
        {1: 0.15, 2: 0.2, 3: 0.8, 4: 0.9, 5: 0.5, 6: 0.2, 7: 0.05, 8: 0.1},
    ];

    init = () => {        
        let canvas = document.getElementById('canvas'); 
        let ctx = canvas.getContext('2d');

        let width = canvas.width;//window.getComputedStyle(canvas).getPropertyValue('width');
        let height = canvas.height;//window.getComputedStyle(canvas).getPropertyValue('height');
        let w = parseInt(width);
        let h = parseInt(height);

        this.padding = this.padding.split(' ');
        this.ymax = h * parseInt(this.padding[0]) / 100;
        this.ymin = h - this.ymax;
        this.xmin = w * parseInt(this.padding[1]) / 100;
        this.xmax = w - this.xmin;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = this.legendColor; 
        ctx.lineWidth = 2.0; 
        ctx.beginPath();
        ctx.moveTo(this.xmin, this.ymax); 
        ctx.lineTo(this.xmin, this.ymin); 
        ctx.lineTo(this.xmax, this.ymin); 
        ctx.stroke(); 

        let widthInc = this.xmin;
        let heightInc = (h - this.ymin * 2) / (this.vsplit + 1);
        let firstKey = 0;
        let min = 10;
        let max = -10;

        for (let c in this.data) {
            firstKey = Object.keys(this.data[c]).shift();
            widthInc = (w - this.xmin * 2) / (Object.keys(this.data[c]).length + 1);
            break;
        }

        for (let c in this.data) {
            for (let k in this.data[c]) {
                if (this.data[c][k] < min) min = Math.floor(this.data[c][k]);
                if (this.data[c][k] > max) max = Math.ceil(this.data[c][k]);
            }
        }

        console.log(width, height, this.ymax, this.ymin, this.xmax, this.xmin, min, max);

        for (let c in this.data) {
            ctx.strokeStyle = this.colors[c]; 
            ctx.lineWidth = 1.0; 
            ctx.beginPath();
            

            let x = this.xmin + widthInc / 2;
            let y = this.ymax + heightInc + (1 - (this.data[c][firstKey] / (Math.abs(min) + Math.abs(max)))) * (h - this.ymax * 2 - heightInc);
            ctx.moveTo(x, y); 
            
            for (let k in this.data[c]) {
                if (k === firstKey) continue;
                x += widthInc;
                y = this.ymax + (heightInc / 2) + (1 - (this.data[c][k] / (Math.abs(min) + Math.abs(max)))) * (h - this.ymax * 2 - heightInc / 2);
                ctx.lineTo(x, y);
            }
            ctx.stroke(); 
        }
    }

    render(){
        setTimeout(this.init, 100);
        return (
            <React.Fragment>
                <canvas id="canvas" style={{height: this.props.height}}></canvas>
            </React.Fragment>
        );
    }
}