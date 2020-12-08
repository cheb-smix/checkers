let type = "xhr";

export default function postData(obj = {})
{
    let o = {url: "", data: {}, success: () => {}, error: () => {}, dataType: "json", method: "POST", headers: {}};
    for (let k in obj) o[k] = obj[k];
    
    o.headers["Content-Type"] = 'application/x-www-form-urlencoded';
    if (Object.keys(window.loft.device) > 0) o.headers['App-User-Agent'] = JSON.stringify(window.loft.device);
    
    console.log("using", type, o);

    if (type === "fetch") {
        return fatch(o); // Fetch is not supported on cordova
    } else if (type === "xhr") {
        return xhr(o);
    }
}

function xhr(o = {})
{
    let xhr = new XMLHttpRequest();
    xhr.open(o.method, o.url, true);

    for (let h in o.headers) xhr.setRequestHeader(h, o.headers[h]);

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return false;
        
        if (xhr.status !== 200 && xhr.status !== 0) {

            console.log(xhr.status + ': ' + xhr.statusText);
            alert(o.url + '. ' + xhr.status + ': ' + xhr.statusText);
            o.error();

        } else {
            
            let data = xhr.responseText;
            if(o.dataType==="json"){
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
    if(typeof(o.data) === "object") o.data = object2string(o.data);
    //console.log(data);
    xhr.send(o.data);
}

async function fatch(o = {})
{
    let response = await fetch(o.url, {
        method: o.method,
        headers: o.headers,
        body: object2string(o.data),
    });

    if (response.ok) {
        let res = "";
        if (o.dataType==="json") {
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