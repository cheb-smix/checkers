import App from '../App';

const findClosestTarget = (column, row = 8) => {
    for (let n = column-1; n<=column+1; n++) {
        if (n === column-1 && (column > 4 || Math.random() < 0.5)) continue;
        if ((row+n)%2===1) return n + ":8";
    }
}

export default class Checkers extends App{

    getCheckersPriority = (cells) => {
        let w = {x:1,y:8},b = {x:8,y:1};
        let targetCells = this.state.targetCells;
        for(let k in targetCells.black){
            let x = targetCells.black[k].x, y = targetCells.black[k].y;
            if(cells[k].color!=="black") if(x<b.x || y>b.y) b = {x:x,y:y}
        }
        for(let k in targetCells.white){
            let x = targetCells.white[k].x, y = targetCells.white[k].y;
            if(cells[k].color!=="white") if(x>w.x || y<w.y) w = {x:x,y:y}
        }
        
        for(let k in cells){
            let color = cells[k].color;
            if(color){
                if(color==="black"){
                    cells[k].priority = { target: findClosestTarget(cells[k].x, 8), level: 5 };
                }else{
                    cells[k].priority = { target: findClosestTarget(cells[k].x, 1), level: 5 };
                }
            }
        }
        return cells;
    }

    finalizatorCorrection = (c) => {
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
    }

    compareFunc1 = (a,b) => {
        return a.effectivity!==b.effectivity ? (a.effectivity>b.effectivity?-1:1) : (a.priority.level!==b.priority.level?(a.priority.level>b.priority.level?-1:1):0);
    }
    compareFunc2 = (a,b) => {
        return a.effectivity!==b.effectivity ? (a.effectivity>b.effectivity?-1:1) : (Math.random()<0.5?1:-1);
    }
    compareFunc3 = (a,b) => {
        return a.priority.level!==b.priority.level ? (a.priority.level>b.priority.level?-1:1) : (a.len!==b.len?(a.len>b.len?-1:1):0);
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
            && c[k1].color !== color) ? [k1,k2] : false;
    }

    checkTheDamka = (c,p,x,y,direction="left up",color) => {
        let vars = [];
        let xe = -1;
        let ye = -1;
        x = Math.abs(x); y = Math.abs(y);
        if(direction==="right up") xe = 1;
        if(direction==="left down") ye = 1;
        if(direction==="right down"){
            xe=1;ye=1;
        }
        let enemyColor = color === "black" ? "white" : "black";
        let path = [x+":"+y];
        for(let n=1; n<7; n++){
            let k1 = (x+(n*xe))+":"+(y+(n*ye));
            path.push(k1);
            if (typeof(c[k1]) === "undefined") break;
            if (c[k1].color !== enemyColor) continue;
            console.log(`found enemy on ${k1}`);

            let blocker = false;
            for(let m=n+1; m<7; m++){
                let k2 = (x+(m*xe))+":"+(y+(m*ye));
                
                
                if (typeof(p[k2]) !== "undefined") continue;
                if (typeof(c[k2]) === "undefined" || c[k2].checker !== false) {
                    blocker = true;
                    break;
                }
                path.push(k2);
                let pathCopy = this.deepArrCopy(path);
                vars.push({path: pathCopy, kill: k1});
            }
            if (blocker) break;
        }
        return vars;
    }

    getPossibilitiesRecursive(koords,oldcells=false,oldpossibilities,cell,restrictedDirection=-1){
        let possibilities = Object.assign({},oldpossibilities);
        const {0: x, 1: y} = koords.split(":");

        let directions = ["left up","right up","left down","right down"];

        cell.damka = ((cell.color === "white" && y === '1') || (cell.color === "black" && y === '8') || cell.damka || possibilities[koords].damka);

        for(let i=0; i < directions.length; i++){
            
            if (i === restrictedDirection) continue;

            if (cell.damka) {
                let vars = this.checkTheDamka(oldcells,possibilities,x,y,directions[i],cell.color); 
                
                for(let k in vars) {
                    let last = vars[k].path[vars[k].path.length - 1];
                    possibilities[last] = {
                        damka: true,
                        kills: [...possibilities[koords].kills, vars[k].kill],
                        path: [...possibilities[koords].path,...vars[k].path]
                    };
                    possibilities[last].len = possibilities[last].path.length;
                    possibilities[last].effectivity = possibilities[last].kills.length * 2 + 1;

                    possibilities = this.getPossibilitiesRecursive(last,oldcells,possibilities,cell,3 - i);
                }
            } else {
                let k = this.checkTheChecker(oldcells,possibilities,x,y,directions[i],cell.color);
                if(k!==false){
                    let ny = k[1][2];
                    
                    cell.damka = ((cell.color === "white" && ny === '1') || (cell.color === "black" && ny === '8'));
                    possibilities[k[1]] = {
                        damka: cell.damka,
                        kills: [...possibilities[koords].kills, k[0]],
                        len: 3,
                        effectivity: 3,
                        path: [...possibilities[koords].path,koords,...k]
                    };
                    possibilities = this.getPossibilitiesRecursive(k[1],oldcells,possibilities,cell,3 - i);
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
            path: []
        };
        possibilities = this.getPossibilitiesRecursive(koords,oldcells,possibilities,oldcells[koords]);

        let closestCells = [];

        if (oldcells[koords].damka === true) {
            closestCells = [
                (x-1)+":"+(y-1),//left up
                (x+1)+":"+(y-1),//right up
                (x-1)+":"+(y+1),//left down
                (x+1)+":"+(y+1),//right down
            ];
        } else {
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
        
        for(let i in closestCells){
            let k = closestCells[i];
            if(typeof(oldcells[k]) !== "undefined" && oldcells[k].checker===false) possibilities[k] = {
                damka: oldcells[koords].damka,
                kills: [],
                len: 0.5,
                effectivity: 1,
                path: [koords, k]
            };
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
        let rndcomfunc = Math.floor(1 + Math.random() * 3);
        //let a = ["", "h", "h,rnd", "len"];
        /*if(this.state.playstage===3){
            rndcomfunc = 2;
        }else{
            rndcomfunc = 9;
        }
        rndcomfunc = 1;*/
        //console.log("Used compareFunc"+rndcomfunc,a[rndcomfunc]);
        iicells.sort(this["compareFunc"+rndcomfunc]);
        /*
        if(this.state.playstage===3){
            //let rndcomfunc = "compareFunc"+Math.floor(1+Math.random()*6);
            let rndcomfunc = "compareFunc9";
            console.log("Used "+rndcomfunc);
            iicells.sort(this[rndcomfunc]);
        }else{
            if(Math.random()<0.7){
                console.log("Used compareFunc",4);
                iicells.sort(this.compareFunc4);
            }else{
                console.log("Used compareFunc",2);
                iicells.sort(this.compareFunc2);
            }
        }*/
        console.log(iicells);
        if(iicells.length > 0){
            let index = 0;
            if(this.state.autochess) index = Math.floor(Math.random()*iicells.length*0.2);
            let c = iicells[index];
            c.possibilities = cells[c.from].possibilities;

            if(c.effectivity<2){
                while(this.checkFutherMoves(c)<0){
                    index++;
                    while(index<iicells.length-1 && index<4 && iicells[index].from===iicells[index-1].from) index++;
                    if(index>iicells.length-1 || index>4) index = 0;
                    c = iicells[index];
                    c.possibilities = cells[c.from].possibilities;
                    if(index===0) break;
                }
                if(index > 0){
                    while(index>0 && iicells[index].effectivity<0){
                        index--;
                        c = iicells[index];
                        c.possibilities = cells[c.from].possibilities;
                    }
                }
            }
            
            console.log("Taken checker:",index,c);
            if(typeof(c.type)!=="undefined") this.rampage(0,c.type);
            ///////Final corrector

            if(this.state.playstage===3) c = this.finalizatorCorrection(c);

            //////Finishing best move calculation
            this.doStep(c.to, c.from, true, false);
        }else{
            if(!force){
                this.iiStep(color,true,dbstep);
            }else{
                this.rampage(0,"NO MOVES :(");
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
        //console.log("Checking offline status");
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

                for(let p in cells[nkoords].possibilities){
                    if(cells[nkoords].possibilities[p].kills.length > 0) {
                        mustEat[cells[nkoords].color] = nkoords;
                    }
                }

                if (cells[nkoords].damka) console.log("DAMKA", cells[nkoords]);
                
                /*for(let p in cells[nkoords].possibilities){
                    let o = {};
                    if(cells[nkoords].possibilities[p]===false){
                        o.path = [nkoords,p];
                        o.len = 0.5;
                        o.kills = [];
                        o.effectivity = 1;
                    }else{
                        o.path = cells[nkoords].possibilities[p];
                        o.len = cells[nkoords].possibilities[p].length-1;
                        o.kills = o.path.filter((v, k) => {
                            return k%2===1;
                        });
                        o.effectivity = 1 + o.kills.length * 2;
                        mustEat[cells[nkoords].color] = nkoords;
                    }

                    if(typeof(this.state.targetCells.lessPriorityCells)!=="undefined" && typeof(this.state.targetCells.lessPriorityCells[p])!=="undefined"){
                        o.len += this.state.targetCells.lessPriorityCells[p];
                        o.lessPriority = true;
                        if(o.effectivity>0) o.effectivity *= -1;
                        /////Correction less priority cells
                    }
                    cells[nkoords].possibilities[p] = o;
                }*/
            }
        }

        if (mustEat.black !== false) {
            for(let nkoords in cells){
                if(cells[nkoords].color === "black"){
                    for(let p in cells[nkoords].possibilities){
                        if (cells[nkoords].possibilities[p].len < 1) {
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
                        if (cells[nkoords].possibilities[p].len < 1) {
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
        kek[c.from].checker = false;
        kek[c.from].color = false;
        kek = this.regeneratePossibilities(kek);

        let bfd = null; // bad future
        
        for(let k in kek){
            if(kek[k].color!==c.color && kek[k].color!==false){
                for(let p in kek[k].possibilities){

                    let path_b = kek[k].possibilities[p].path.filter((e,i)=>(i%2));
                    //console.log(kek[k].possibilities[p].path,path_b);

                    if(path_b.indexOf(c.to) >= 0){
                        if(kek[k].possibilities[p].kills > 1 || (!bfd || bfd.kills < kek[k].possibilities[p].kills)){
                            bfd = kek[k].possibilities[p];
                        }
                    }

                }
            }
        }
        if (bfd) checkinFutureEffectivity -= bfd.effectivity;

        //console.log("\n\n\n\n\nFutureAnalyzeResult",checkinFutureEffectivity,c.from,c.to,"\n",bfd,"\n\n\n\n\n");

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
                        if((x===3 && y===2) || (x===2 && y===1)){
                            checker = false;
                            color = false;
                        }
                        if(x===4 && y===3){
                            checker =  "white"+key;
                            color = "white";
                        }
                        if((x===1 && y===6) || (x===8 && y===5) || (x===3 && y===2)){
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