import "./index.css";
import React from 'react';
import Lang from '../Localization';

export default class Charts extends React.Component {
    height      = this.props.height ? this.props.height : '15vh';
    legendColor = this.props.legendColor ? this.props.legendColor : '#1e6899';
    bgColor     = this.props.bgColor ? this.props.bgColor : '#053352';
    padding     = this.props.padding ? this.props.padding : '10% 5%';
    colors      = this.props.colors ? this.props.colors : ["red", "blue", "green"];
    data        = this.props.data ? this.props.data : {};
    /*{
        "Kills-Losses Ratio": {1: 0.25, 2: 0.5, 3: 0.75, 4: 0.88, 5: 0.45, 6: 0.66, 7: 0.45, 8: 0.99},
        "Wins-Failes Radio": {1: 0.35, 2: 0.12, 3: 0.7, 4: 0.8, 5: 0.5, 6: 0.6, 7: 0.1, 8: 0.1},
        "Steps": {1: 0.15, 2: 0.2, 3: 0.8, 4: 0.9, 5: 0.5, 6: 0.2, 7: 0.05, 8: 0.1},
    };*/
    font        = this.props.font ? this.props.font : '1vh Federo';
    dots        = this.props.dots ? this.props.dots : 'true';

    chart       = this.props.chart ? this.props.chart : true;
    ysplit      = this.props.ysplit ? this.props.ysplit : 5;
    xsplit;
    canvas;
    ctx;
    cwidth;
    cheight;

    inited      = false;
    shown       = false;
    initCnt     = 0;

    init = () => {
        this.canvas = document.getElementById('canvas'); 
        this.ctx = this.canvas.getContext('2d');

        let interval = setInterval(() => {
            let LCW = window.getComputedStyle(this.canvas).getPropertyValue('width');
            if (LCW !== '100%' && LCW !== this.cwidth) {
                this.cwidth = LCW;
                this.cheight = window.getComputedStyle(this.canvas).getPropertyValue('height');
                this.canvas.setAttribute('width', this.cwidth);
                this.canvas.setAttribute('height', this.cheight);
                this.canvas.style.transform = 'perspective(900px) rotate3d(100, 0, 0, 0deg) scale(1)';
                this.shown = true;
                if (this.initCnt > 5) clearInterval(interval);
                this.show();
                this.initCnt++;
            }
        }, 100);
    }

    show = () => {
        if (!this.inited) this.init();
        
        let w = parseInt(this.cwidth);
        let h = parseInt(this.cheight);

        if (typeof(this.padding) === 'string') this.padding = this.padding.split(' ');
        let ymax = h * parseInt(this.padding[0]) / 100;
        let ymin = h - ymax;
        let xmin = w * parseInt(this.padding[1]) / 100;
        let xmax = w - xmin;

        this.ctx.clearRect(0, 0, w, h);
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, w, h);

        this.ctx.strokeStyle = this.legendColor; 
        this.ctx.lineWidth = 2.0; 
        this.ctx.beginPath();
        this.ctx.moveTo(xmin, ymax); 
        this.ctx.lineTo(xmin, ymin); 
        this.ctx.lineTo(xmax, ymin); 
        this.ctx.stroke(); 

        let widthInc = xmin;
        let heightInc = (h - ymax * 2) / (this.ysplit + 1);
        let Xlegend = [];
        let LLegend = Object.keys(this.data);
        let min = 10;
        let max = -10;

        this.data = Object.values(this.data);

        for (let c in this.data) {
            Xlegend = Object.keys(this.data[c]);
            this.xsplit = Xlegend.length;
            widthInc = (w - xmin * 2) / (this.xsplit + 1);
            this.data[c] = Object.values(this.data[c]);
        }

        for (let c in this.data) {
            for (let k in this.data[c]) {
                if (this.data[c][k] < min) min = Math.floor(this.data[c][k]);
                if (this.data[c][k] > max) max = Math.ceil(this.data[c][k]);
            }
        }

        let minmaxinc = (Math.abs(min) + Math.abs(max)) / this.ysplit;

        for (let n = 0; n <= this.ysplit; n++) {
            let y = ymax + heightInc * n + heightInc;
            this.ctx.textAlign = "end";
            this.ctx.font = this.font;
            this.ctx.lineWidth = 0.1; 
            this.ctx.beginPath();
            this.ctx.fillStyle = '#fff';//this.legendColor;  
            this.ctx.fillText(Math.pround((max - n * minmaxinc), 1), xmin - 3, y - 3); 
            this.ctx.strokeStyle = '#fff'; 
            this.ctx.moveTo(xmin - 5, y); 
            this.ctx.lineTo(xmax, y);
            this.ctx.stroke(); 
        }

        let xlabel = false;

        for (let c in this.data) {
            if (!xlabel) {
                this.ctx.textAlign = "center";
                this.ctx.font = this.font;
                this.ctx.strokeStyle = '#fff'; 
                this.ctx.lineWidth = 0.1; 
                this.ctx.fillStyle = '#fff';//this.legendColor; 
                for (let n = 0; n <= this.xsplit; n++) {
                    let x = xmin + widthInc * n;
                    this.ctx.beginPath();
                    if (n < this.xsplit) this.ctx.fillText(Xlegend[n], x + widthInc / 2, ymin + 11); 
                    this.ctx.moveTo(x, ymin + 5); 
                    this.ctx.lineTo(x, ymax);
                    this.ctx.stroke(); 
                }
                xlabel = true;
            }

            this.ctx.strokeStyle = this.colors[c]; 
            this.ctx.fillStyle = this.colors[c];
            this.ctx.lineWidth = 2.0; 
            this.ctx.beginPath();

            let x = xmin + widthInc / 2;
            let y = ymax + heightInc + (1 - (this.data[c][0] / (Math.abs(min) + Math.abs(max)))) * (h - ymax * 2 - heightInc);
            this.ctx.moveTo(x, y); 
            if (this.dots === 'true') this.ctx.fillRect(x - 2, y - 2, 5, 5);

            let c1 = {x: x, y: y};
            let c2 = {x: x + widthInc, y: ymax + heightInc + (1 - (this.data[c][1] / (Math.abs(min) + Math.abs(max)))) * (h - ymax * 2 - heightInc)};
            let c3 = {x: x + widthInc * 2, y: ymax + heightInc + (1 - (this.data[c][2] / (Math.abs(min) + Math.abs(max)))) * (h - ymax * 2 - heightInc)};

            let b = Math.findBezier(null, c1, c2, c3);
            
            for (let k = 0; k < this.data[c].length; k++) {
                if (k === 0) continue;
                x += widthInc;
                y = ymax + heightInc + (1 - (this.data[c][k] / (Math.abs(min) + Math.abs(max)))) * (h - ymax * 2 - heightInc);
                
                this.ctx.bezierCurveTo(b.n1.x, b.n1.y, b.n2.x, b.n2.y, x, y);

                c1 = {x: x, y: y};
                c2 = React.isset(this.data[c][k + 1]) ? {x: x + widthInc, y: ymax + heightInc + (1 - (this.data[c][k + 1] / (Math.abs(min) + Math.abs(max)))) * (h - ymax * 2 - heightInc)} : null;
                c3 = React.isset(this.data[c][k + 2]) ? {x: x + widthInc * 2, y: ymax + heightInc + (1 - (this.data[c][k + 2] / (Math.abs(min) + Math.abs(max)))) * (h - ymax * 2 - heightInc)} : null;

                if (c2) b = Math.findBezier(b.n2, c1, c2, c3);

                if (this.dots === 'true') this.ctx.fillRect(x - 2, y - 2, 5, 5);
            }
            this.ctx.stroke(); 
        }

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(xmax - widthInc * 1.9, ymax / 2, widthInc * 1.9 + xmin / 2, heightInc * 0.95 * LLegend.length);
        this.ctx.strokeStyle = this.legendColor;
        this.ctx.lineWidth = 2.0; 
        this.ctx.strokeRect(xmax - widthInc * 1.9, ymax / 2, widthInc * 1.9 + xmin / 2, heightInc * 0.95 * LLegend.length);

        for (let i = 0; i < LLegend.length; i++) {
            let y = ymax / 4 + (heightInc * (i + 1)) * 0.8;
            let x = xmax - widthInc * 1.8;

            this.ctx.fillStyle = this.colors[i];
            this.ctx.fillRect(x, y, Math.abs(heightInc / 4), Math.abs(heightInc / 4));

            this.ctx.textAlign = "start";
            this.ctx.fillStyle = '#fff';//this.legendColor;  
            let text = Lang(LLegend[i] + "ChartText");
            text = text.length > 12 ? text.substr(0, 12) + '.' : text;
            this.ctx.fillText(text, x + 10, y + heightInc / 4); 
        }
    }

    render(){
        if (!React.empty(this.data) && this.chart && !this.inited) {
            this.inited = true;
            setTimeout(this.init, 100);
        }
        return (
            <canvas id="canvas" style={{height: this.height}}></canvas>
        );
    }
}