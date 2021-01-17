let noiseTypes = {
    soft: 5,
    medium: 3,
    hard: 1,
};
let fanfaras = ["draw", "victory", "fail", "epic", "epic-rock"];

export default function Noise(type = "soft") {

    let volume = window.loft.usersettings.soundvolume / 100;
    if (fanfaras.indexOf(type) >= 0) {
        volume = window.loft.usersettings.fanfaravolume / 100;
    }
    if (volume === 0) return;

    volume /= 1.5;

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

    if (typeof(window.loft.sounds[src]) === "undefined") { // lazy loading =)
        window.loft.sounds[src] = new Audio(src);
    }
    window.loft.sounds[src].volume = volume;
    window.loft.sounds[src].play();
}