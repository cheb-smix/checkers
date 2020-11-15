import App from '../App';

export default class Corners extends App{

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
                let abstractPriority=null, possiblePriority=null, level=0;
                if(color==="black"){
                    abstractPriority = { target: b, level: this.calculatePifagorColored(cells[k],b,color) };
                }else{
                    abstractPriority = { target: w, level: this.calculatePifagorColored(cells[k],w,color) };
                }
                for(let t in targetCells[color+"reverse"]){
                    if(cells[t].color===color) continue;
                    level = this.calculatePifagorColored(cells[k],targetCells[color+"reverse"][t],color);
                    if(typeof(cells[k].possibilities[t])!=="undefined" && (possiblePriority === null || level > possiblePriority.level)){
                        possiblePriority = { target: targetCells[color+"reverse"][t], level: level };
                    }
                }
                cells[k].priority = possiblePriority!==null ? possiblePriority : abstractPriority;
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
                    console.log("Changing destination from "+c.to+" to "+p+"["+hypotenuse +"-"+ c.hypotenuse+"] target: ",c.priority.target);
                    c.to = p;
                    c.hypotenuse = hypotenuse;
                }
            }
        }
        return c;
    }

    compareFunc1 = (a,b) => {
        //////Main compare based on sorting by possibility steps count and priority
        return a.effectivity!==b.effectivity ? (a.effectivity>b.effectivity?-1:1) : (a.priority.level!==b.priority.level?(a.priority.level>b.priority.level?-1:1):0);
    }
    compareFunc2 = (a,b) => {
        //////Main compare based on sorting by possibility steps count only
        return a.effectivity!==b.effectivity ? (a.effectivity>b.effectivity?-1:1) : (Math.random()<0.5?1:-1);
    }
    compareFunc3 = (a,b) => {
        ///////Secodary compare for pulling up lagging based on sorting by priority, possibility 
        return a.priority.level!==b.priority.level ? (a.priority.level>b.priority.level?-1:1) : (a.effectivity!==b.effectivity?(a.effectivity>b.effectivity?-1:1):0);
    }
    compareFunc4 = (a,b) => {
        return a.s4!==b.s4?(a.s4>b.s4?-1:1):0;
        ///////New compare based on sorting by multiplication of possibility steps and priority
        let ax = a.priority.level*a.effectivity*((a.priority.level<0 && a.effectivity<0)?-1:1);
        let bx = b.priority.level*b.effectivity*((b.priority.level<0 && b.effectivity<0)?-1:1);
        return ax!==bx ? (ax>bx?-1:1) : (Math.random()<0.5?1:-1);
    }
    compareFunc5 = (a,b) => {
        return a.s5!==b.s5?(a.s5>b.s5?-1:1):0;
        ///////Secodary compare for pulling up lagging based on sorting by addition of possibility steps and priority
        let ax = a.priority.level+a.effectivity;
        let bx = b.priority.level+b.effectivity;
        return ax!==bx ? (ax>bx?-1:1) : (a.effectivity!==b.effectivity?(a.effectivity>b.effectivity?-1:1):0);
    }
    compareFunc6 = (a,b) => {
        ///////Secodary compare for pulling up lagging based on sorting by priority, possibility
        let alvl = Math.abs(a.priority.level);
        let blvl = Math.abs(b.priority.level);
        let alen = Math.abs(a.effectivity);
        let blen = Math.abs(b.effectivity);
        return alvl!==blvl ? (alvl>blvl?-1:1) : (alen!==blen?(alen>blen?-1:1):0);
    }
    compareFunc7 = (a,b) => {
        return a.s7!==b.s7?(a.s7>b.s7?-1:1):0;
        ///////Finishing playstage comparator 
        let ax = Math.abs(a.priority.level) - Math.abs(a.effectivity);
        let bx = Math.abs(b.priority.level) - Math.abs(b.effectivity);
        if(ax!==bx) return ax>bx?-1:1;
        return 0;
    }
    compareFunc8 = (a,b) => {
        return a.s8!==b.s8?(a.s8>b.s8?-1:1):0;
        return (a.priority.level/a.effectivity>b.priority.level/b.effectivity && a.effectivity>0)?-1:1;
    }
    compareFunc9 = (a,b) => {
        return a.s9!==b.s9?(a.s9>b.s9?-1:1):0;
        let ax = a.effectivity * a.priority.level * a.len;
        let bx = a.effectivity * a.priority.level * a.len;
        if(ax===bx) return 0;
        return ax>bx?1:-1;
    }

    genCellObjByKeyAndPoss = (k,p,h=this.state.cells[k].possibilities[p].effectivity) => {
        let c = this.state.cells[k];
        let s4 = c.priority.level * h * ((c.priority.level<0 && h<0)?-1:1);
        let s5 = c.priority.level + h;
        let s7 = Math.abs(c.priority.level) - Math.abs(h);
        let s8 = c.priority.level / h;
        let s9 = c.priority.level * h * c.possibilities[p].len
        return {
            from:       k, 
            to:         p, 
            s4, s5, s7, s8, s9,
            priority:   c.priority, 
            len:        c.possibilities[p].len,
            path:       c.possibilities[p].path,
            effectivity: h,
            color:      c.color,
            koordsfrom: {x:k[0],y:k[2]}, 
            koordsto:   {x:p[0],y:p[2]}
        }
    }

    lonelyCheckerExponent = (cells,k) => {
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
    }

    checkTheChecker = (c,p,x,y,direction="left") => {
        //Left check default
        let xe = -1;
        let ye = 0;
        x = Math.abs(x); y = Math.abs(y);
        if(direction==="right") xe = 1; //Right check
        if(direction==="up"){
            xe=0;ye=-1; //Up check
        }
        if(direction==="down"){
            xe=0;ye=1; //Down check
        }
        let k1 = (x+(1*xe))+":"+(y+(1*ye));
        let k2 = (x+(2*xe))+":"+(y+(2*ye));

        return (typeof(c[k1]) !== "undefined" && c[k1].checker!==false && typeof(c[k2]) !== "undefined" && c[k2].checker===false && typeof(p[k2])==="undefined")?[k1,k2]:false;
    }

    getPossibilitiesRecursive(koords,oldcells=false,oldpossibilities){
        let possibilities = Object.assign({},oldpossibilities);
        const {0: x, 1: y} = koords.split(":");
        const directions = ["left","up","right","down"];
        for(let i in directions){
            let k = this.checkTheChecker(oldcells,possibilities,x,y,directions[i]);
            if(k!==false){
                possibilities[k[1]] = [...possibilities[koords],k[0],k[1]];
                possibilities = this.getPossibilitiesRecursive(k[1],oldcells,possibilities);
            }
        }
        return possibilities;
    }

    getClosestPossibilites(koords,oldcells=false){
        let possibilities = {};
        if(oldcells===false) oldcells = this.state.cells;

        const {x,y} = oldcells[koords];
        possibilities[koords] = [koords];
        possibilities = this.getPossibilitiesRecursive(koords,oldcells,possibilities);

        let closestCells = [
            (x-1)+":"+y,//left
            (x+1)+":"+y,//right
            x+":"+(y-1),//up
            x+":"+(y+1),//down
        ];
        
        for(let i in closestCells){
            let k = closestCells[i];
            if(typeof(oldcells[k]) !== "undefined" && oldcells[k].checker===false) possibilities[k] = false;
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
        }
        ///////Second priority and main algorithm using generated possibilities
        for(let k in cells){
            if(cells[k].color===color){
                if(force===false){
                    if(typeof(this.state.targetCells[color][k])!=="undefined"){
                        continue; //leave already placed checkers in peace
                    }
                }                        
                for( let p in cells[k].possibilities){
                    if(cells[k].possibilities[p].effectivity > 0 || force){
                        let h = cells[k].possibilities[p].effectivity;
                        if(typeof(this.state.targetCells[color][p])!=="undefined") h *= 2;
                        if(force && this.state.playstage===3) h = Math.abs(h);
                        iicells.push(this.genCellObjByKeyAndPoss(k,p,h));
                    }
                }
            }
        }
        ///////Third 3 in 1 algorithms using sorting
        let rndcomfunc = Math.floor(2+Math.random()*8);
        let a = ["","h,lvl","h,rnd","lvl,h","s4","s5","|lvl|,|h|","s7","h==0,s8","s9"];
        if(this.state.playstage===3){
            rndcomfunc = 2;
        }else{
            rndcomfunc = 9;
        }
        rndcomfunc = 1;
        console.log("Used compareFunc"+rndcomfunc,a[rndcomfunc]);
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
            let index = 0;//Math.floor(Math.random()*iicells.length*0.03);
            if(this.state.autochess) index = Math.floor(Math.random()*iicells.length*0.2);
            let c = iicells[index];
            c.possibilities = cells[c.from].possibilities;

            if(c.effectivity<50){
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
        const d = {"black":{xs:1,xe:4,ys:6,ye:8},"white":{xs:5,xe:8,ys:1,ye:3}};
        let n = 0;
        for(let x=d[c].xs;x<=d[c].xe;x++){
            for(let y=d[c].ys;y<=d[c].ye;y++){
                if(cells[x+":"+y].color===c) n++;
            }
        }
        return n;
    }

    checkOfflineGameStatus = (playerInfo,opponentInfo) => {
        console.log("Checking offline status");
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
        for(let nkoords in cells){
            if(cells[nkoords].checker !== false){
                cells[nkoords].possibilities = this.getClosestPossibilites(nkoords,cells);
                for(let p in cells[nkoords].possibilities){
                    let o = {};
                    if(cells[nkoords].possibilities[p]===false){
                        o.path = [nkoords,p];
                        o.len = 0.5;
                    }else{
                        o.path = cells[nkoords].possibilities[p];
                        o.len = cells[nkoords].possibilities[p].length-1;
                    }

                    let [x,y] = p.split(":");
                    let DE = this.calculateDiagonalEffectivity(cells[nkoords],{x:x,y:y},cells[nkoords].color);
                    for(let n in DE) o[n] = DE[n];

                    if(typeof(this.state.targetCells.lessPriorityCells)!=="undefined" && typeof(this.state.targetCells.lessPriorityCells[p])!=="undefined"){
                        o.len += this.state.targetCells.lessPriorityCells[p];
                        o.lessPriority = true;
                        if(o.effectivity>0) o.effectivity *= -1;
                        /////Correction less priority cells
                    }
                    cells[nkoords].possibilities[p] = o;
                }
            }
        }
        cells = this.getCheckersPriority(cells);
        for(let nkoords in cells){
            if(cells[nkoords].checker !== false){
                let n = this.lonelyCheckerExponent(cells,nkoords);
                cells[nkoords].priority.exp = n;
                cells[nkoords].priority.level *= n;
                for(let p in cells[nkoords].possibilities) cells[nkoords].possibilities[p].effectivity *= n;
            }
        }
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
                    /*if(x>4 && x<9 && y>0 && y<4){
                        checker =  "white"+key;
                        color = "white";
                    }
                    if(x===5 && y===3){
                        checker = false;
                        color = false;
                    }
                    if(x===5 && y===4){
                        checker =  "white"+key;
                        color = "white";
                    }
                    if(x>0 && x<5 && y>5 && y<9){
                        checker = "black"+key;
                        color = "black";
                    }
                    if(x===2 && y===6){
                        checker = false;
                        color = false;
                    }
                    if(x===2 && y===5){
                        checker =  "black"+key;
                        color = "black";
                    }*/
                }else{
                    if(x>0 && x<5 && y>5 && y<9){
                        checker = "white"+key;
                        color = "white";
                    }
                    if(x>4 && x<9 && y>0 && y<4){
                        checker = "black"+key;
                        color = "black";
                    }
                }
                cells[x+":"+y] = {x:x,y:y,k:key,checker:checker,color:color,possibilities:{},active:false};
                key++;
            }
        }
        let k = 0;
        if(debug){
            while(k<24){
                let x = Math.floor(Math.random()*8)+1;
                let y = Math.floor(Math.random()*8)+1;
                if(cells[x+":"+y].color===false){
                    let color = k<12?"white":"black";
                    let checker = color+k;
                    cells[x+":"+y] = {x:x,y:y,k:k*100,checker:checker,color:color,possibilities:{},active:false};
                    k++;
                }
            }
        }
        return this.regeneratePossibilities(cells);
    }

    setTargetCells = () => {
        let targetCells = {
            b:["1:8","2:8","1:7","1:6","2:7","3:8","4:8","3:7","2:6","3:6","4:7","4:6"],
            w:["8:1","7:1","8:2","8:3","7:2","6:1","5:1","6:2","7:3","6:3","5:2","5:3"],
            black:{},
            white:{},
            blackreverse:{},
            whitereverse:{},
            lessPriorityCells: {
                "1:1":-5,"2:1":-3,"1:2":-3,"1:3":-2,"2:2":-2,"3:1":-2,"8:8":-5,"7:8":-3,"8:7":-3,"6:8":-2,"8:6":-2,"7:7":-2
            }
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