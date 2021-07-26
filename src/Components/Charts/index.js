import "./index.css";
import React from 'react';

export default class Charts extends React.Component {
    height = this.props.height ? this.props.height : '15vh';
    legendColor = this.props.legendColor ? this.props.legendColor : '#1e6899';
    bgColor  = this.props.bgColor ? this.props.bgColor : '#053352';
    padding  = this.props.padding ? this.props.padding : '10% 5%';
    ymax;
    ymin;
    xmax;
    xmin;
    ysplit = this.props.ysplit ? this.props.ysplit : 5;
    xsplit;
    colors = this.props.colors ? this.props.colors : [
        "red", "blue", "green"
    ];
    data = this.props.data ? this.props.data : {
        "Kills-Losses Ratio": {1: 0.25, 2: 0.5, 3: 0.75, 4: 0.88, 5: 0.45, 6: 0.66, 7: 0.45, 8: 0.99},
        "Wins-Failes Radio": {1: 0.35, 2: 0.12, 3: 0.7, 4: 0.8, 5: 0.5, 6: 0.6, 7: 0.1, 8: 0.1},
        "Steps": {1: 0.15, 2: 0.2, 3: 0.8, 4: 0.9, 5: 0.5, 6: 0.2, 7: 0.05, 8: 0.1},
    };
    font = this.props.font ? this.props.font : '1vh Federo';
    dots = this.props.dots ? this.props.dots : 'true';

    inited = false;

    init = () => {       
        // this.data = {TMP: this.data["WLR"]};
        
        let canvas = document.getElementById('canvas'); 
        let ctx = canvas.getContext('2d');

        let width = window.getComputedStyle(canvas).getPropertyValue('width');
        let height = window.getComputedStyle(canvas).getPropertyValue('height');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        let w = parseInt(width);
        let h = parseInt(height);

        console.log(this.padding);

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
        let heightInc = (h - this.ymax * 2) / (this.ysplit + 1);
        let Xlegend = [];
        let LLegend = Object.keys(this.data);
        let min = 10;
        let max = -10;

        this.data = Object.values(this.data);

        for (let c in this.data) {
            Xlegend = Object.keys(this.data[c]);
            this.xsplit = Xlegend.length;
            widthInc = (w - this.xmin * 2) / (this.xsplit + 1);
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
            let y = this.ymax + heightInc * n + heightInc;
            ctx.textAlign = "end";
            ctx.font = this.font;
            ctx.lineWidth = 0.1; 
            ctx.beginPath();
            ctx.fillStyle = 'white';//this.legendColor;  
            ctx.fillText(Math.pround((max - n * minmaxinc), 1), this.xmin - 3, y - 3); 
            ctx.strokeStyle = 'white'; 
            ctx.moveTo(this.xmin - 5, y); 
            ctx.lineTo(this.xmax, y);
            ctx.stroke(); 
        }

        let xlabel = false;

        for (let c in this.data) {
            if (!xlabel) {
                ctx.textAlign = "center";
                ctx.font = this.font;
                ctx.strokeStyle = 'white'; 
                ctx.lineWidth = 0.1; 
                ctx.fillStyle = 'white';//this.legendColor; 
                for (let n = 0; n <= this.xsplit; n++) {
                    let x = this.xmin + widthInc * n;
                    ctx.beginPath();
                    if (n < this.xsplit) ctx.fillText(Xlegend[n], x + widthInc / 2, this.ymin + 11); 
                    ctx.moveTo(x, this.ymin + 5); 
                    ctx.lineTo(x, this.ymax);
                    ctx.stroke(); 
                }
                xlabel = true;
            }

            ctx.strokeStyle = this.colors[c]; 
            ctx.fillStyle = this.colors[c];
            ctx.lineWidth = 2.0; 
            ctx.beginPath();

            let x = this.xmin + widthInc / 2;
            let y = this.ymax + heightInc + (1 - (this.data[c][0] / (Math.abs(min) + Math.abs(max)))) * (h - this.ymax * 2 - heightInc);
            ctx.moveTo(x, y); 
            if (this.dots === 'true') ctx.fillRect(x - 2, y - 2, 5, 5);

            let c1 = {x: x, y: y};
            let c2 = {x: x + widthInc, y: this.ymax + heightInc + (1 - (this.data[c][1] / (Math.abs(min) + Math.abs(max)))) * (h - this.ymax * 2 - heightInc)};
            let c3 = {x: x + widthInc * 2, y: this.ymax + heightInc + (1 - (this.data[c][2] / (Math.abs(min) + Math.abs(max)))) * (h - this.ymax * 2 - heightInc)};

            let b = Math.findBezier(null, c1, c2, c3);
            
            for (let k = 0; k < this.data[c].length; k++) {
                if (k === 0) continue;
                x += widthInc;
                y = this.ymax + heightInc + (1 - (this.data[c][k] / (Math.abs(min) + Math.abs(max)))) * (h - this.ymax * 2 - heightInc);
                
                ctx.bezierCurveTo(b.n1.x, b.n1.y, b.n2.x, b.n2.y, x, y);

                c1 = {x: x, y: y};
                c2 = React.isset(this.data[c][k + 1]) ? {x: x + widthInc, y: this.ymax + heightInc + (1 - (this.data[c][k + 1] / (Math.abs(min) + Math.abs(max)))) * (h - this.ymax * 2 - heightInc)} : null;
                c3 = React.isset(this.data[c][k + 2]) ? {x: x + widthInc * 2, y: this.ymax + heightInc + (1 - (this.data[c][k + 2] / (Math.abs(min) + Math.abs(max)))) * (h - this.ymax * 2 - heightInc)} : null;

                if (c2) b = Math.findBezier(b.n2, c1, c2, c3);

                if (this.dots === 'true') ctx.fillRect(x - 2, y - 2, 5, 5);
            }
            ctx.stroke(); 
        }

        ctx.fillStyle = this.bgColor;
        ctx.fillRect(this.xmax - widthInc * 1.3, this.ymax / 2, widthInc * 1.3 + this.xmin / 2, heightInc * 0.95 * LLegend.length);
        ctx.strokeStyle = this.legendColor;
        ctx.lineWidth = 2.0; 
        ctx.strokeRect(this.xmax - widthInc * 1.3, this.ymax / 2, widthInc * 1.3 + this.xmin / 2, heightInc * 0.95 * LLegend.length);

        for (let i = 0; i < LLegend.length; i++) {
            let y = this.ymax / 4 + (heightInc * (i + 1)) * 0.8;
            let x = this.xmax - widthInc * 1.2;

            ctx.fillStyle = this.colors[i];
            ctx.fillRect(x, y, Math.abs(heightInc / 4), Math.abs(heightInc / 4));

            ctx.textAlign = "start";
            ctx.fillStyle = 'white';//this.legendColor;  
            let text = LLegend[i].length > 18 ? LLegend[i].substr(0, 17) + '..' : LLegend[i];
            ctx.fillText(text, x + 10, y + heightInc / 4); 
        }
    }

    render(){
        if (!this.inited) {
            this.inited = true;
            setTimeout(this.init, 100);
        }
        return (
            <React.Fragment>
                <canvas id="canvas" style={{height: this.height}}></canvas>
            </React.Fragment>
        );
    }
}