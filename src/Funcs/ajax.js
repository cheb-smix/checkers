export default function ajax(obj = {})
{
    let o = {url: "", params: "", success: () => {}, error: () => {}, responseType: "json", method: "POST", device: {}};
    for (let k in obj) o[k] = obj[k];

    const xhr = new XMLHttpRequest();
    xhr.open(o.method, o.url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    if (Object.keys(o.device) > 0) xhr.setRequestHeader('App-User-Agent', JSON.stringify(o.device));

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return false;
        if (xhr.status !== 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
            alert(xhr.statusText);
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
/*
export default async function ajax(obj = {})
{
    let o = {url: "", params: "", success: () => {}, error: () => {}, responseType: "json", method: "POST", device: {}};
    for (let k in obj) o[k] = obj[k];

    console.log(o.url, o.params);

    let formData = new FormData();

    for (var k in o.params) {
        formData.append(k, o.params[k]);
    }

    let response = await fetch(o.url, {
        method: o.method,
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "User-Agent": JSON.stringify(o.device),
        },
        body: formData,
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
        console.log(res);
        if (o.success) o.success(res);
        return res;
    } else {
        console.log("Ошибка HTTP: " + response.status);
        o.error();
    }
    return false
}
*/

function object2string(obj)
{
    let s = [];
    for(let i in obj){
        s.push(i+"="+encodeURIComponent(obj[i]));
    }
    return s.join("&");
}