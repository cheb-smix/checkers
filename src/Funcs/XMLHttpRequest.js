export default function XMLHR(params="",onsuccess=()=>{},onerror=()=>{},responseType="json",method="POST",url="") {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return false;
        if (xhr.status !== 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
            onerror();
        } else {
            let data = xhr.responseText;
            if(responseType==="json"){
                try {
                    data = JSON.parse(data);
                    console.log(data);
                } catch(e) {
                    console.log(e,data);
                }
            }
            onsuccess(data);
        }
    }
    console.log(params);
    xhr.send(params);
}