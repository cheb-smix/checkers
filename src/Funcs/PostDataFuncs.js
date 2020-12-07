let type = "xhr";

export default function postData(obj = {})
{
    if (type === "fetch") {
        return fatch(obj); // Fetch is not supported on cordova
    } else if (type === "xhr") {
        return xhr(obj);
    }
}

function xhr(obj = {})
{
    let o = {url: "", params: "", success: () => {}, error: () => {}, responseType: "json", method: "POST", device: {}};
    for (let k in obj) o[k] = obj[k];

    //console.log(o);

    const xhr = new XMLHttpRequest();
    xhr.open(o.method, o.url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    if (Object.keys(o.device) > 0) xhr.setRequestHeader('App-User-Agent', JSON.stringify(o.device));

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return false;
        console.log(xhr.getAllResponseHeaders());
        if (xhr.status !== 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
            alert(o.url + '. ' + xhr.status + ': ' + xhr.statusText);
            o.error();
        } else {
            let data = xhr.responseText;
            if(o.responseType==="json"){
                try {
                    data = JSON.parse(data);
                    //console.log(data);
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

async function fatch(obj = {})
{
    let o = {url: "", params: "", success: () => {}, error: () => {}, responseType: "json", method: "POST", device: {}, headers: {}};
    for (let k in obj) o[k] = obj[k];

    console.log(o);

    o.headers["Content-Type"] = 'application/x-www-form-urlencoded';
    if (Object.keys(o.device) > 0) o.headers["App-User-Agent"] = JSON.stringify(o.device);

    let response = await fetch(o.url, {
        method: o.method,
        headers: o.headers,
        body: object2string(o.params),
    });

    if (response.ok) {
        let res = "";
        if (o.responseType==="json") {
            try {
                res = await response.json();
            } catch(e) {
                res = await response.text();
                console.log(e, res);
            }
        } else {
            res = await response.text();
        }
        response.headers.forEach(function(value, name) {
            console.log(name + ": " + value);
        });
        console.log(res);
        if (o.success) o.success(res);
        return res;
    } else {
        console.log("Ошибка HTTP: " + response.status);
        o.error();
    }
    return false;
}

function object2string(obj)
{
    let s = [];
    for(let i in obj){
        s.push(i+"="+encodeURIComponent(obj[i]));
    }
    return s.join("&");
}