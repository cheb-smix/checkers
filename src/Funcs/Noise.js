let noiseTypes = {
    soft: 5,
    medium: 3,
    hard: 1,
};

export default function Noise(type = "soft", volume = false) {

    volume = volume === false ? document.querySelector("#soundplayer").volume : volume;
    if (volume === 0) return;

    volume /= 2;

    let src = type + ".wav";
    if (type > 0) {
        if (type < 3) type = "soft";
        else if (type >= 3 && type < 6) type = "medium";
        else type = "hard";
    }
    if (typeof(noiseTypes[type]) !== "undefined") {
        src = "step-" + type + Math.ceil(Math.random() * noiseTypes[type]) + ".wav";
    }
    src = "sound/" + src;

    let a = new Audio(src);
    a.volume = volume;
    a.play();
}