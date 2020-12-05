export default function ajax(obj = {})
{
    let o = {url: "", params: "", success: () => {}, error: () => {}, responseType: "json", method: "POST", device: {}};
    for (let k in obj) o[k] = obj[k];

    const xhr = new XMLHttpRequest();
    xhr.open(o.method, o.url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    if (o.device) xhr.setRequestHeader('User-Agent-App', JSON.stringify(o.device));

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return false;
        if (xhr.status !== 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
            o.error();
        } else {
            let data = xhr.responseText;
            if(o.responseType==="json"){
                try {
                    data = JSON.parse(data);
                    console.log(data);
                } catch(e) {
                    console.log(e,data);
                }
            }
            o.success(data);
        }
    }
    if(typeof(o.params) === "object") o.params = object2string(o.params);
    //console.log(params);
    xhr.send(o.params);
}


function object2string(obj)
{
    let s = [];
    for(let i in obj){
        s.push(i+"="+encodeURIComponent(obj[i]));
    }
    return s.join("&");
}