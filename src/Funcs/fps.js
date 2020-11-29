/* FPS COUNTER */
let busy = false;
let frameCount = function _fc(timeStart){

    let now = performance.now();
    let duration = now - timeStart;
    
    if(duration < 100){
        _fc.counter++;
    } else {
        _fc.fps = _fc.counter * 10;
        _fc.counter = 0;
        timeStart = now; 
        if (document.querySelector("#fps")) document.querySelector("#fps").innerHTML = _fc.fps;
        
        if (_fc.fps < 50 && !busy) {
            let c = document.querySelector('.neonconsole');
            if (c) {
                c.className = "console glitch";
                c.style.textAlign = "center";
                c.style.fontSize = "18px";
                c.style.fontFamily = "Federo";
                c.style.textTransform = "uppercase";
            }
            busy = false;
        }

    }
    requestAnimationFrame(() => frameCount(timeStart)); 
}

frameCount.counter = 0;
frameCount.fps = 0;

frameCount(performance.now());