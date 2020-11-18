import App from '../App';

const findClosestColumn = (column, row = 8) => {
    for (let n = column-1; n<=column+1; n++) {
        if (n === column-1 && (column > 4 || Math.random() < 0.5)) continue;
        if ((row+n)%2===1) return n + ":" + row;
    }
}

const findClosestDiagonalPossition = (cell) => {
    if (cell.x < 4 && cell.y>4) return "1:8";
    return "8:1";
}

export default class Checkers extends App{

    getCheckersPriority = (cells) => {
        
        for(let k in cells){
            if(cells[k].color){
                if (cells[k].damka && Math.random()<0.3) {
                    cells[k].priority = { target: findClosestDiagonalPossition(cells[k]), level: 3 };
                } else {
                    if (cells[k].color === "black"){
                        cells[k].priority = { target: findClosestColumn(cells[k].x, 8), level: 5 };
                    } else {
                        cells[k].priority = { target: findClosestColumn(cells[k].x, 1), level: 5 };
                    }
                }
            }
        }
        return cells;
    }

    /*finalizatorCorrection = (c) => {
        if(c.dbstep) return c;
        let currentCheckerTargetHypotenuse = this.calculatePifagor(c.koordsfrom,c.priority.target);
        for(let t in this.state.targetCells[c.color]){
            if(this.state.cells[t]===false){
                let h1 = this.calculatePifagor(c.koordsfrom,this.state.targetCells[c.color][t]);
                if(currentCheckerTargetHypotenuse < h1){
                    c.priority.target = this.state.targetCells[c.color][t];
                    currentCheckerTargetHypotenuse = h1;
                }
            }
        }
        if(c.priority.target.x+":"+c.priority.target.y === c.to) return c;
        for(let p in c.possibilities){
            let [x,y] = p.split(":");
            let hypotenuse = this.calculatePifagor({x:x,y:y},c.priority.target);
            if(Math.abs(hypotenuse)<Math.abs(c.hypotenuse)){
                if(c.to !== p){
                    //console.log("Changing destination from "+c.to+" to "+p+"["+hypotenuse +"-"+ c.hypotenuse+"] target: ",c.priority.target);
                    c.to = p;
                    c.hypotenuse = hypotenuse;
                }
            }
        }
        return c;
    }*/

    compareFunc1 = (a,b) => {
        return a.effectivity!==b.effectivity ? (a.effectivity>b.effectivity?-1:1) : (a.priority.level!==b.priority.level?(a.priority.level>b.priority.level?-1:1):0);
    }
    compareFunc2 = (a,b) => {
        return a.effectivity!==b.effectivity ? (a.effectivity>b.effectivity?-1:1) : (Math.random()<0.5?1:-1);
    }

    genCellObjByKeyAndPoss = (k,p,h=this.state.cells[k].possibilities[p].effectivity) => {
        let c = this.state.cells[k];
        return {
            from:       k, 
            to:         p, 
            priority:   c.priority, 
            len:        c.possibilities[p].len,
            path:       c.possibilities[p].path,
            effectivity: h,
            color:      c.color,
            koordsfrom: {x:k[0],y:k[2]}, 
            koordsto:   {x:p[0],y:p[2]}
        }
    }

    /*lonelyCheckerExponent = (cells,k) => {
        let [cx,cy] = k.split(":");
        let color = cells[k].color;
        cx=Math.abs(cx);
        cy=Math.abs(cy);
        let foundEnemy = false;
        for(let x=cx-1;x<cx+2;x++){
            for(let y=cy-1;y<cy+2;y++){
                if(x===cx && y===cy) continue;
                let ck = x+":"+y;
                if(typeof(cells[ck])==="undefined") continue;
                if(cells[ck].color===color){
                    return 1;
                }
                if(cells[ck].color!==color && cells[ck].color!==false){
                    foundEnemy = true;
                }
            }
        }
        if(foundEnemy) return 3;
        return 4;
    }*/

    checkTheChecker = (c,p,x,y,direction="left up",color) => {
        //left up check default
        let xe = -1;
        let ye = -1;
        x = Math.abs(x); y = Math.abs(y);
        if(direction==="right up") xe = 1;
        if(direction==="left down") ye = 1;
        if(direction==="right down"){
            xe=1;ye=1;
        }
        let k1 = (x+(1*xe))+":"+(y+(1*ye));
        let k2 = (x+(2*xe))+":"+(y+(2*ye));

        return (typeof(c[k1]) !== "undefined" && c[k1].checker!==false && typeof(c[k2]) !== "undefined" && c[k2].checker===false && typeof(p[k2])==="undefined" 
            && c[k1].color !== color) ? {place: k2, kill: k1, len: 2} : false;
    }

    checkTheDamka = (c, p, x, y, direction="left up", color, freeRide=false) => {
        let vars = [];
        let xe = -1;
        let ye = -1;
        x = Math.abs(x); y = Math.abs(y);
        if(direction==="right up") xe = 1;
        if(direction==="left down") ye = 1;
        if(direction==="right down"){
            xe=1;ye=1;
        }
        
        for(let n=1; n<7; n++){
            let k1 = (x+(n*xe))+":"+(y+(n*ye));
            if (typeof(c[k1]) === "undefined" || c[k1].color === color) break;
            if (c[k1].color === false) {
                if (freeRide) vars.push({place: k1, kill: [], len: n});
                continue;
            }
            if (freeRide) break;
            let blocker = false;
            for(let m=n+1; m<7; m++){
                let k2 = (x+(m*xe))+":"+(y+(m*ye));
                
                if (typeof(p[k2]) !== "undefined") continue;
                if (typeof(c[k2]) === "undefined" || c[k2].checker !== false) {
                    blocker = true;
                    break;
                }
                
                vars.push({place: k2, kill: k1, len: m});
            }
            if (blocker) break;
        }
        return vars;
    }

    getPossibilitiesRecursive(koords,oldcells=false,oldpossibilities,cell,restrictedDirection=-1){
        let possibilities = Object.assign({},oldpossibilities);
        const {0: x, 1: y} = koords.split(":");

        let directions = ["left up","right up","left down","right down"];

        let pathString = possibilities[koords].path.join("|");

        let damka = ((cell.color === "white" && pathString.indexOf(":1") > 0) || (cell.color === "black" && pathString.indexOf(":8") > 0));

        for(let i=0; i < directions.length; i++){
            
            if (i === restrictedDirection) continue;

            if (damka) {
                let vars = this.checkTheDamka(oldcells,possibilities,x,y,directions[i],cell.color); 
                
                for(let k in vars) {

                    possibilities[vars[k].place] = {
                        damka: true,
                        kills: [...possibilities[koords].kills, vars[k].kill],
                        path: [...possibilities[koords].path, vars[k].place],
                        len: possibilities[koords].len + vars[k].len,
                        effectivity: possibilities[koords].effectivity + 2
                    };

                    possibilities = this.getPossibilitiesRecursive(vars[k].place,oldcells,possibilities,cell,3 - i);
                }
            } else {
                let vars = this.checkTheChecker(oldcells,possibilities,x,y,directions[i],cell.color);
                if(vars !== false){
                    possibilities[vars.place] = {
                        damka: ((cell.color === "white" && vars.place[2] === '1') || (cell.color === "black" && vars.place[2] === '8')),
                        kills: [...possibilities[koords].kills, vars.kill],
                        path: [...possibilities[koords].path, vars.place],
                        len: possibilities[koords].len + vars.len,
                        effectivity: possibilities[koords].effectivity + 2
                    };
                    possibilities = this.getPossibilitiesRecursive(vars.place,oldcells,possibilities,cell,3 - i);
                }
            }
        }
        return possibilities;
    }

    getClosestPossibilites(koords, oldcells=false, mustEat=false){
        let possibilities = {};
        if(oldcells===false) oldcells = this.state.cells;

        const {x,y} = oldcells[koords];
        possibilities[koords] = {
            damka: oldcells[koords].damka,
            kills: [],
            len: 0,
            effectivity: 0,
            path: [koords]
        };
        possibilities = this.getPossibilitiesRecursive(koords,oldcells,possibilities,oldcells[koords]);

        let closestCells = [];

        if (oldcells[koords].damka !== true) {
            if (mustEat===false) {
                if (oldcells[koords].color === "white") {
                    closestCells = [
                        (x-1)+":"+(y-1),//left up
                        (x+1)+":"+(y-1),//right up
                    ];
                } 
                if (oldcells[koords].color === "black") {
                    closestCells = [
                        (x-1)+":"+(y+1),//left down
                        (x+1)+":"+(y+1),//right down
                    ];
                }
            }            
        }
        if (oldcells[koords].damka === true) {
            if (mustEat===false) {
                let directions = ["left up","right up","left down","right down"];
                for(let i=0; i < directions.length; i++){
                    let vars = this.checkTheDamka(oldcells,possibilities,x,y,directions[i],oldcells[koords].color,true);  
                    for(let k in vars) {
                        possibilities[vars[k].place] = {
                            damka: true,
                            kills: [],
                            path: [koords, vars[k].place],
                            len: vars[k].len,
                            effectivity: 1
                        };
                    }
                }
            }
        } else {
            for(let i in closestCells){
                let k = closestCells[i];
                let damka = ((oldcells[koords].color === "white" && k[2] === '1') || (oldcells[koords].color === "black" && k[2] === '8'));
                if(typeof(oldcells[k]) !== "undefined" && oldcells[k].checker===false) possibilities[k] = {
                    damka: damka,
                    kills: [],
                    len: 1,
                    effectivity: 1,
                    path: [koords, k]
                };
            }
        }
        delete possibilities[koords];
        
        return possibilities;
    }

    iiStep = (color, force=false, dbstep=false) => {
        if(force) console.log("FORCED step");
        let iicells = [];
        if(dbstep){
            iicells.push(this.genCellObjByKeyAndPoss(dbstep.from,dbstep.to,dbstep.effectivity*10));
            iicells[0].dbstep = true;
        }
        let {cells} = this.state;

        ///////Algorythm to block an enemy best move
/*
        let psbl2checker = {};
        let bestP2BEnemy = null;
        for(let k in cells){
            if(cells[k].color===color){
                for(let p in cells[k].possibilities){
                    if(cells[k].possibilities[p].len>0){
                        if(typeof(psbl2checker[p])==="undefined") psbl2checker[p] = [];
                        psbl2checker[p].push({
                            k:k,
                            l:cells[k].possibilities[p].len,
                            h:cells[k].possibilities[p].effectivity
                        });
                    }
                }
            }
        }
        for(let p in psbl2checker){
            psbl2checker[p].sort((a,b)=>{return a.h!==b.h ? (a.h>b.h?-1:1):0});
        }
        for(let k in cells){
            if(cells[k].color!==color && cells[k].color!==false){
                for(let p in cells[k].possibilities){
                    if(cells[k].possibilities[p].effectivity > 2.85){
                        let cnt = Math.round(cells[k].possibilities[p].len * 0.5);
                        for(let i=1;i<cnt;i++){
                            let psbl = cells[k].possibilities[p].path[i];
                            if(typeof(psbl2checker[psbl])!=="undefined"){
                                if(bestP2BEnemy===null || bestP2BEnemy.effectivity<psbl2checker[psbl][0].h){
                                    if(psbl2checker[psbl][0].h > -1.1){
                                        bestP2BEnemy = this.genCellObjByKeyAndPoss(psbl2checker[psbl][0].k,psbl);
                                        bestP2BEnemy['targetEnemy'] = psbl2checker[psbl][0];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if(bestP2BEnemy !== null){
            bestP2BEnemy.len = Math.abs(bestP2BEnemy.len)*10;
            let [x,y] = bestP2BEnemy.to.split(":");
            bestP2BEnemy.priority.target = {x:x,y:y};
            bestP2BEnemy.priority.level = 100;
            bestP2BEnemy['type'] = "BLOCKER";
            iicells.push(bestP2BEnemy);
        }*/
        ///////Second priority and main algorithm using generated possibilities
        for(let k in cells){
            if(cells[k].color===color){                   
                for( let p in cells[k].possibilities){
                    if(cells[k].possibilities[p].len > 0 || force){
                        let h = cells[k].possibilities[p].effectivity;
                        if(typeof(this.state.targetCells[color][p])!=="undefined") h *= 2;
                        if(force && this.state.playstage===3) h = Math.abs(h);
                        iicells.push(this.genCellObjByKeyAndPoss(k,p,h));
                    }
                }
            }
        }
        ///////Third 3 in 1 algorithms using sorting
        let rndcomfunc = Math.floor(1 + Math.random() * 2);

        console.log("Used compareFunc"+rndcomfunc);
        iicells.sort(this["compareFunc"+rndcomfunc]);

        //console.log(iicells);
        if(iicells.length > 0){

            for (let index=0; iicells.length; index++) {
                let c = iicells[index];
                if (typeof(c) === "undefined") break;
                c.possibilities = cells[c.from].possibilities;
                iicells[index].effectivity = this.checkFutherMoves(c);
            }
            iicells.sort(this["compareFunc"+rndcomfunc]); // 1 more sorting
            for (let index=0; iicells.length; index++) {
                let c = iicells[index];
                if (typeof(c) === "undefined") break;
                c.possibilities = cells[c.from].possibilities;
                iicells[index].effectivity = this.checkFutherMoves(c);
            }
            iicells.sort(this["compareFunc"+rndcomfunc]); // 2 more sorting

            let index = 0;
            if(this.state.autochess) index = Math.floor(Math.random()*iicells.length*0.1);
            let c = iicells[index];
            
            //console.log("Taken checker:",index,c);
            if(typeof(c.type)!=="undefined") this.rampage(0,c.type);

            this.doStep(c.to, c.from, true, false);
        }else{
            if(!force){
                this.iiStep(color,true,dbstep);
            }else{
                this.rampage(0,"NO MOVES!");
            }
        }
    }

    countDoneCheckers = (cells,c) => {
        c = c === "black" ? "white" : "black";
        let n = 12;
        for(let k in cells){
            if(cells[k].color === c) n--;
        }
        
        return n;
    }

    checkOfflineGameStatus = (playerInfo,opponentInfo) => {
        if(opponentInfo.status==="winner" || playerInfo.status==="winner") return false;

        let changes = false;
        if(playerInfo.done===12 && playerInfo.status==="in_game"){
            changes = true;
            playerInfo.status = "winner";
            opponentInfo.status = "looser";
        }
        if(opponentInfo.done===12 && opponentInfo.status==="in_game"){
            changes = true;
            playerInfo.status = "looser";
            opponentInfo.status = "winner";
        }
        
        if((opponentInfo.status==="winner" || playerInfo.status==="winner") && (this.state.writesteps || this.state.writestats)){
            let postdata = {
                action: "saveGameEnding",
                game_id: this.state.game_id,
                gtoken: this.state.gtoken,
            }
            for(let n in playerInfo){
                postdata[n+playerInfo.color[0]] = playerInfo[n];
            }
            for(let n in opponentInfo){
                postdata[n+opponentInfo.color[0]] = opponentInfo[n];
            }
            if(this.state.XMLHRAvailable){
                this.XMLHR(postdata,(data)=>{
                    if(changes) this.setMazafuckinState({playerInfo:playerInfo,opponentInfo:opponentInfo});
                    if(this.state.autochess){
                        setTimeout(()=>{
                            window.location.reload();
                        },5000);
                    }
                });
            }
        }
        if(changes && !this.state.XMLHRAvailable) return {playerInfo:playerInfo,opponentInfo:opponentInfo};
        return false;
    }

    regeneratePossibilities = (cells) => {

        let mustEat = {
            "black": false,
            "white": false
        };

        for(let nkoords in cells){
            if(cells[nkoords].checker !== false){
                
                cells[nkoords].possibilities = this.getClosestPossibilites(nkoords, cells, mustEat[cells[nkoords].color]);

                let poss2delete = [];

                for(let p in cells[nkoords].possibilities){

                    for(let move in cells[nkoords].possibilities[p]){
                        if (typeof(cells[nkoords].possibilities[move]) !== "undefined" && cells[nkoords].possibilities[move].kills.length < cells[nkoords].possibilities[p].kills.length) {
                            poss2delete[move] = 1;
                        }
                    }

                    if (cells[nkoords].possibilities[p].kills.length > 0) {
                        mustEat[cells[nkoords].color] = nkoords;
                    }

                }

                if (poss2delete) for(let move in poss2delete) delete cells[nkoords].possibilities[move];

            }
        }

        if (mustEat.black !== false) {
            for(let nkoords in cells){
                if(cells[nkoords].color === "black"){
                    for(let p in cells[nkoords].possibilities){
                        if (cells[nkoords].possibilities[p].kills.length === 0) {
                            delete cells[nkoords].possibilities[p];
                        }
                    }
                }
                if (nkoords === mustEat.black) break;
            }
        }
        if (mustEat.white !== false) {
            for(let nkoords in cells){
                if(cells[nkoords].color === "white"){
                    for(let p in cells[nkoords].possibilities){
                        if (cells[nkoords].possibilities[p].kills.length === 0) {
                            delete cells[nkoords].possibilities[p];
                        }
                    }
                }
                if (nkoords === mustEat.white) break;
            }
        }


        cells = this.getCheckersPriority(cells);

        return cells;
    }

    checkFutherMoves = (c) => {
        let kek = this.deepCopy(this.state.cells);
        let checkinFutureEffectivity = kek[c.from].possibilities[c.to].effectivity;
        kek[c.to].checker = kek[c.from].checker;
        kek[c.to].color = kek[c.from].color;
        kek[c.to].damka = kek[c.from].damka;
        kek[c.from].checker = false;
        kek[c.from].color = false;
        kek[c.from].damka = false;
        kek = this.regeneratePossibilities(kek);

        let bfd = null; // bad future
        
        for(let k in kek){
            if(kek[k].color!==c.color && kek[k].color!==false){
                for(let p in kek[k].possibilities){
                    if(kek[k].possibilities[p].kills.indexOf(c.to) >= 0 || kek[k].possibilities[p].effectivity > checkinFutureEffectivity){
                        bfd = kek[k].possibilities[p];
                    }
                }
            }
        }
        if (bfd) {
            checkinFutureEffectivity -= bfd.effectivity;

            //console.log("\n\n\n\n\nFutureAnalyzeResult",checkinFutureEffectivity,c.from,c.to,"\n",bfd,"\n\n\n\n\n");
        }

        return checkinFutureEffectivity;
    }

    dropCheckersToDefaults = (debug = this.state.debug) => {
        let cells = {};
        let key = 1;
        for(let y=1;y<9;y++){
            for(let x=1;x<9;x++){
                let checker = false;
                let color = false;
                if(debug){
                    if((y+x)%2===1){
                        if (y>5 && y<9) {
                            color = "white";
                            checker = `${color}${key}`;
                        }
                        if (y>0 && y<4) {
                            color = "black";
                            checker = `${color}${key}`;
                        }
                        if((x===3 && y===2) || (x===2 && y===1) || (x===2 && y===3)){
                            checker = false;
                            color = false;
                        }
                        if(x===4 && y===3){
                            checker =  "white"+key;
                            color = "white";
                        }
                        if((x===1 && y===4) || (x===8 && y===5) || (x===3 && y===2) || (x===3 && y===4)){
                            checker =  "black"+key;
                            color = "black";
                        }
                    }
                }else{
                    if((y+x)%2===1){
                        if (y>5 && y<9) {
                            color = "white";
                            checker = `${color}${key}`;
                        }
                        if (y>0 && y<4) {
                            color = "black";
                            checker = `${color}${key}`;
                        }
                    }
                }
                cells[x+":"+y] = {x:x,y:y,k:key,checker:checker,color:color,possibilities:{},active:false};
                key++;
            }
        }
        
        return this.regeneratePossibilities(cells);
    }

    setTargetCells = () => {

        let targetCells = {
            b:["1:8","2:8","3:8","4:8","5:8","6:8","7:8","8:8"],
            w:["1:1","2:1","3:1","4:1","5:1","6:1","7:1","8:1"],
            black:{},
            white:{},
            blackreverse:{},
            whitereverse:{},
            lessPriorityCells: {}
        };

        for(let i in targetCells.b){
            let key = targetCells.b[i];
            let [x,y] = key.split(":");
            targetCells.black[key] = {x:x,y:y};
        }
        targetCells.b.reverse();
        for(let i in targetCells.b){
            let key = targetCells.b[i];
            let [x,y] = key.split(":");
            targetCells.blackreverse[key] = {x:x,y:y};
        }
        for(let i in targetCells.w){
            let key = targetCells.w[i];
            let [x,y] = key.split(":");
            targetCells.white[key] = {x:x,y:y};
        }
        targetCells.w.reverse();
        for(let i in targetCells.w){
            let key = targetCells.w[i];
            let [x,y] = key.split(":");
            targetCells.whitereverse[key] = {x:x,y:y};
        }

        return targetCells;
    }
}