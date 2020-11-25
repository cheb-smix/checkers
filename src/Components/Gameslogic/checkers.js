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

    compareFunc1 = (a,b) => {
        return a.effectivity!==b.effectivity ? (a.effectivity>b.effectivity?-1:1) : (a.priority.level!==b.priority.level?(a.priority.level>b.priority.level?-1:1):(Math.random()<0.5?1:-1));
    }
    compareFunc2 = (a,b) => {
        return a.effectivity!==b.effectivity ? (a.effectivity>b.effectivity?-1:1) : (Math.random()<0.5?1:-1);
    }

    /*genCellObjByKeyAndPoss = (k,p,h=this.state.cells[k].possibilities[p].effectivity) => {
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
            && c[k1].color !== color && p[x+':'+y].kills.indexOf(k2)<0) ? {place: k2, kill: k1, len: 2} : false;
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
            if (p[x+':'+y].kills.indexOf(k1) >= 0) break;
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

    getPossibilitiesRecursive(koords,oldcells=false,oldpossibilities,cell){
        let possibilities = Object.assign({},oldpossibilities);
        const {0: x, 1: y} = koords.split(":");

        let directions = ["left up","right up","left down","right down"];

        let pathString = possibilities[koords].path.join("|");

        let damka = ((cell.color === "white" && pathString.indexOf(":1") > 0) || (cell.color === "black" && pathString.indexOf(":8") > 0) || cell.damka);

        for(let i=0; i < directions.length; i++){

            if (damka) {
                let vars = this.checkTheDamka(oldcells, possibilities, x, y, directions[i], cell.color); 
                
                for(let k in vars) {
                    possibilities[vars[k].place] = {
                        damka:  true,
                        kills:  [...possibilities[koords].kills, vars[k].kill],
                        path:   [...possibilities[koords].path, vars[k].place],
                        len:    possibilities[koords].len + vars[k].len,
                        effectivity: possibilities[koords].effectivity + 2,
                        from:   possibilities[koords].path[0],
                        to:     vars[k].place,
                        priority: cell.priority,
                        color:  cell.color
                    };

                    possibilities = this.getPossibilitiesRecursive(vars[k].place,oldcells,possibilities,cell);
                }
            } else {
                let vars = this.checkTheChecker(oldcells, possibilities, x, y, directions[i], cell.color);
                if(vars !== false){
                    possibilities[vars.place] = {
                        damka: ((cell.color === "white" && vars.place[2] === '1') || (cell.color === "black" && vars.place[2] === '8')),
                        kills: [...possibilities[koords].kills, vars.kill],
                        path: [...possibilities[koords].path, vars.place],
                        len: possibilities[koords].len + vars.len,
                        effectivity: possibilities[koords].effectivity + 2,
                        from:   possibilities[koords].path[0],
                        to:     vars.place,
                        priority: cell.priority,
                        color:  cell.color
                    };
                    possibilities = this.getPossibilitiesRecursive(vars.place,oldcells,possibilities,cell);
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
                            effectivity: 1,
                            from:   koords,
                            to:     vars[k].place,
                            priority: oldcells[koords].priority,
                            color: oldcells[koords].color
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
                    path: [koords, k],
                    from:   koords,
                    to:     k,
                    priority: oldcells[koords].priority,
                    color: oldcells[koords].color
                };
            }
        }
        delete possibilities[koords];
        
        return possibilities;
    }

    iiStep = (color, force=false, dbstep=false) => {
        if(force) console.log("FORCED step");
        let iicells = [];
        /*if(dbstep){
            iicells.push(this.genCellObjByKeyAndPoss(dbstep.from,dbstep.to,dbstep.effectivity*10));
            iicells[0].dbstep = true;
        }*/
        let {cells} = this.state;
 
        for(let k in cells){
            if(cells[k].color===color){                   
                for( let p in cells[k].possibilities){
                    if(cells[k].possibilities[p].len > 0 || force){
                        iicells.push(cells[k].possibilities[p]);
                    }
                }
            }
        }

        if(iicells.length > 0){

            ///////Third 3 in 1 algorithms using sorting
            let rndcomfunc = Math.floor(1 + Math.random() * 2);

            //console.log("Used compareFunc"+rndcomfunc);

            iicells = this.watchFuture(iicells, cells, `compareFunc${rndcomfunc}`, 10);

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
                this.rampage(0, "NO MOVES!", "opponent");
            }
        }
    }

    oneMoreFutureStep = (kek, lastFuture, iteration = 0) => {
        let {from, to} = lastFuture;
        let checkingEnemy = iteration % 2 === 0;
        kek[to].checker = kek[from].checker;
        kek[to].color = kek[from].color;
        kek[to].damka = kek[from].damka;
        kek[from].checker = false;
        kek[from].color = false;
        kek[from].damka = false;

        kek = this.regeneratePossibilities(kek);

        let future = null;
            
        for(let k in kek){
            if(kek[k].color!==kek[to].color && kek[k].color!==false){
                for(let p in kek[k].possibilities){
                    if (checkingEnemy) {
                        if (kek[k].possibilities[p].kills.indexOf(to) >= 0 && kek[k].possibilities[p].effectivity > (iteration ? 0 :lastFuture.effectivity)) {
                            if (!future || future.effectivity < kek[k].possibilities[p].effectivity) future = kek[k].possibilities[p];
                        }
                    } else {
                        if (kek[k].possibilities[p].effectivity >= lastFuture.effectivity && (kek[k].possibilities[p].kills.indexOf(to) >= 0 || kek[k].possibilities[p].path.indexOf(from) >= 0)) {
                            if (!future || future.effectivity < kek[k].possibilities[p].effectivity) future = kek[k].possibilities[p];
                        }
                    }
                }
            }
        }
        if (future) {
            future.badFuture = checkingEnemy;
            for (let n in future.kills) {
                kek[future.kills[n]].checker = false;
                kek[future.kills[n]].color = false;
                kek[future.kills[n]].damka = false;
            }
        }

        return future;
    }

    watchFuture = (iicells, cells = this.state.cells, compareFunc, limit = 10) => {

        iicells.sort(this[compareFunc]);
        if (limit > iicells.length) limit = iicells.length;

        let kek;

        for (let index=0; index < limit; index++) {
            let c = iicells[index];
            if (typeof(c) === "undefined") break;

            kek = this.deepCopy(cells);
     
            let futureSteps = [];
            if (c) futureSteps.push(c);
            for (let iteration = 0; iteration < this.state.usersettings.difficulty * 2; iteration++) {
                let l = futureSteps.length;
                if (!futureSteps[l - 1]) break;
                futureSteps.push(this.oneMoreFutureStep(kek, futureSteps[l - 1], iteration));
            }

            futureSteps.shift();
            futureSteps.pop();
            for (let f in futureSteps) {
                if (!futureSteps[f]) break;
                iicells[index].effectivity += futureSteps[f].badFuture ? 0 - futureSteps[f].effectivity : futureSteps[f].effectivity;
            }
            if (futureSteps.length > 1 || iicells[index].damka) console.log(iicells[index].from, iicells[index].to, futureSteps, iicells[index].effectivity);
            
        }

        iicells.sort(this[compareFunc]);
        
        return iicells;
    }

    countDoneCheckers = (cells,c) => {
        c = c === "black" ? "white" : "black";
        let n = 12;
        for(let k in cells){
            if(cells[k].color === c) n--;
        }
        
        return n;
    }

    checkOfflineGameStatus = (playerInfo, opponentInfo) => {
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
                    if (cells[nkoords].possibilities[p].damka) cells[nkoords].possibilities[p].effectivity *= 2;

                    for(let idx = 1; idx < cells[nkoords].possibilities[p].path.length - 1; idx++){
                        let move = cells[nkoords].possibilities[p].path[idx];
                        if (typeof(cells[nkoords].possibilities[move]) !== "undefined") {
                            poss2delete[move] = 1;
                        }
                    }

                    if (cells[nkoords].possibilities[p].kills.length > 0) {
                        mustEat[cells[nkoords].color] = nkoords;
                    } else {
                        if (cells[nkoords].damka) {
                            cells[nkoords].possibilities[p].effectivity *= 0.5;
                        }
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
                        if((x===4 && y===3) || (x===6 && y===3) || (x===5 && y===6) || (x===7 && y===6) || (x===8 && y===7)){
                            checker = false;
                            color = false;
                        }
                        if((x===6 && y===5) || (x===7 && y===6)){
                            checker =  "white"+key;
                            color = "white";
                        }
                        if((x===6 && y===3)){
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