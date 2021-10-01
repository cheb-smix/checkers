let components = {
    "#utitle":      "animate__backOutLeft animate__animated fa-2x",
    ".umaincon":    "umaincon animate__fadeOutLeft animate__animated",
    "#uhiconcontainer": "animate__fadeOutLeft animate__animated fa-2x",
    "#btnContainer": "animate__fadeOut animate__animated",
};

export default function Routing(route = "/home", addonAction = () => {}, timeout = 700)
{
    if (timeout) {

        for (let s in components) {
            let a = document.querySelectorAll(s);
            for (let i = 0; i < a.length; i++) {
                a[i].className = components[s];
            }
        };

        addonAction();

        setTimeout(() => window.loft.history.push(route), timeout);
        
    } else {

        addonAction();
        window.loft.history.push(route);

    }
}