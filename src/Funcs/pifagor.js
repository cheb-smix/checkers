export default function calculatePifagor(c1,c2,color="any"){
    let dx = 0, dy = 0, directionCorrection = 1;
    if(color==="black"){
        dx = c1.x - c2.x;
        dy = c2.y - c1.y;
    }else{
        dx = c2.x - c1.x;
        dy = c1.y - c2.y;
    }
    if(color!=="any" && (dx<0||dy<0)) directionCorrection = -1;
    return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2)) * directionCorrection;
}