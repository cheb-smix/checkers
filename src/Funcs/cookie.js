export default class Cookie
{
    get = (name) => {
        let regex = new RegExp(name + "=([^;]{1,1000})", "g");
        let c = Array.from(document.cookie.matchAll(regex));
        return (c.length && c[0].length)?c[0][1]:false;
    }
    set = (name, value, hours = 4) => {
        let date = new Date(Date.now() + hours * 3600 * 1000);
        date = date.toUTCString();
        document.cookie = `${name}=${value}; path=/; expires=${date}`;
    }
}
