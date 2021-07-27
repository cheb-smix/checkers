import React from 'react';

Math.coefficient = (n1, n2, f = 0) => {
    n2 = n2 !== 0 ? n2 : 1;
    return f ? (n1 / n2).toFixed(f) : (n1 / n2);
}

Math.percent = (n1, n2, f = 0, label = true) => {
    if (label) return Math.coefficient(n1, n2, f) + "%";
    return Math.coefficient(n1, n2, f);
}

Math.diagonalEffectivity = (c1, c2, color = "any", playstage = 1) => {
    let diagonalCorrection = 1;
    let dia1 = c1.x - c1.y;
    let dia2 = c2.x - c2.y;
    let dd = Math.abs(dia1 - dia2);
    if ((dia1 > dia2 && color === "white") || (dia1 < dia2 && color === "black")) diagonalCorrection = -1;
    if (dia1 === dia2) diagonalCorrection = playstage === 3 ? 1 : 0;
    let lessPriorityCellsCorrection = 1 / (Math.abs(4.5 - c2.x) * Math.abs(4.5 - c2.y) / 4);
    lessPriorityCellsCorrection = 1;
    let hypotenuse = Math.pifagor(c1, c2);
    let p = (hypotenuse * lessPriorityCellsCorrection + dd) * diagonalCorrection;
    return { effectivity: p, dia1, dia2, dd, diagonalCorrection, lessPriorityCellsCorrection, hypotenuse };
}

Math.pifagor = (c1, c2) => {
    return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
}

Math.pround = (x, p = 0) => {
    let n = parseInt('1' + '0'.repeat(p));
    return Math.round(x * n) / n;
}

Math.pifagorColored = (c1, c2, color = "any") => {
    let dx = 0, dy = 0, directionCorrection = 1;
    if (color === "black") {
        dx = c1.x - c2.x;
        dy = c2.y - c1.y;
    } else {
        dx = c2.x - c1.x;
        dy = c1.y - c2.y;
    }
    if (color !== "any") {
        if (dx < 0 || dy < 0) directionCorrection = -1;
    }
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) * directionCorrection;
}

Math.time = (timestamp, minlevel = 2) => {
    let level = 0;
    let del = 0;
    let levels = [60, 60, 24, 365];
    let result = [];
    while ((del = timestamp / levels[level]) > 0 || level < minlevel) {
        result.push(('0' + (timestamp % levels[level])).slice(-2));
        timestamp = Math.floor(del);
        level++;
    }
    return result.reverse().join(":");
}

Math.findBezier = (b0 = null, c1, c2, c3 = null) => {
    let x1 = c1.x;
    let y1 = c1.y;
    let x2 = c2.x;
    let y2 = c2.y;

    if (b0) {
        x1 = c1.x + (c1.x - b0.x);
        y1 = c1.y + (c1.y - b0.y);
    }
    if (c1.y === c2.y) {
        x1 = c1.x
        x2 = c2.x;
    }
    if (!c3) {
        x2 = c2.x;
        y2 = c2.y;
    }

    if (c3) {
        x2 = c1.x + (c2.x - c1.x) / 2;
        y2 = c2.y;
        y2 = ((x2 - c2.x) * (c3.y - c2.y) / (c3.x - c2.y)) + c2.y;        
    }

    return {n1: {x: x1, y: y1}, n2: {x: x2, y: y2}};
}

React.isset = (variable) => {
    return typeof (variable) !== 'undefined';
}

React.empty = (variable) => {
    return (variable === '' || !variable || !Object.keys(variable).length);
}