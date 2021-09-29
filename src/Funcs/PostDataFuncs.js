import custom_fetch from './fetch';

//let type = "xhr";
let timeout = 5000;

export default async function postData(obj = {})
{
    let o = {url: "", data: {}, success: () => {}, error: () => {}, dataType: "json", method: "POST", headers: {}};
    for (let k in obj) o[k] = obj[k];
    
    o.headers["Content-Type"] = 'application/x-www-form-urlencoded';
    // o.headers["Content-Type"] = 'application/json';
    o.headers['App-User-Agent'] = JSON.stringify(window.loft.device);
    
    if (window.loft.atoken) o.headers['A-Token'] = window.loft.atoken;
    
    console.log("using", window.loft.reqtype, o);

    try {
        if (window.loft.reqtype === "fatch") {
            return await fatch(o); 
        } else if (window.loft.reqtype === "xhr") {
            return await xhr(o);
        } 
    } catch (e) {
        return false;
    }
}

async function xhr(o = {})
{
    return Promise.race([
        new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(o.method, o.url, true);

            xhr.timeout = timeout;

            for (let h in o.headers) xhr.setRequestHeader(h, o.headers[h]);

            xhr.onload = () => {
                resolve(xhr.response);
            }
            xhr.onerror = () => {
                reject(new Error('Request failed'));
            }

            if(typeof(o.data) === "object") {
                o.data = object2string(o.data);
            }
            xhr.send(o.data);

        }).then((data) => {
            
            if(o.dataType==="json"){
                try {
                    data = JSON.parse(data);
                } catch(e) {
                    console.log(e);
                }
            }
            console.log(data);
            o.success(data);
            return data;

        }).catch((e) => {
            return false;
        }), 
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
}

async function fatch(o = {})
{
    let response = await custom_fetch(o.url, {
        method: o.method,
        headers: o.headers,
        body: object2string(o.data),
    }, timeout).catch((e) => {
        return false;
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