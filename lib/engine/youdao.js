const { net } = require('electron')

const CryptoJS = require('./crypto-js.js');
const apiurl = 'https://openapi.youdao.com/api';



function truncate(q){
    var len = q.length;
    if(len<=20) return q;
    return q.substring(0, 10) + len + q.substring(len-10, len);
}

async function translate(query,engine) {
    const appKey = engine.appid;
    const key = engine.key;
    const name = engine.name;
    let result = {};
    if (appKey == '' || appKey == null || appKey == undefined) {
        result.origintext = '请配置有道翻译应用id';
        result.resulttext = '请配置有道翻译应用id';
        return result;
    } else if(key == '' || key == null || key == undefined) {
        result.origintext = '请配置有道翻译key';
        result.resulttext = '请配置有道翻译key';
        return result;
    }

    let origin = query;//出错时，用于显示最原始的字符串
    query = query.replace(/[\r\n]/g, '');
    var salt = (new Date).getTime();
    var curtime = Math.round(new Date().getTime()/1000);
    var from = 'auto';
    var to = 'zh-CHS';
    var str1 = appKey + truncate(query) + salt + curtime + key;
    
    var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);

    query = Buffer.from(query, 'utf8').toString('utf8');

    query = encodeURI(query);

    const response = await net.fetch(apiurl+'?q='+query+'&appKey='+appKey+'&salt='+salt+'&from='+from+'&to='+to+'&sign='+sign+'&signType=v3&curtime='+curtime);
    if (response.ok) {
        const res = await response.json();
        //console.log(res);
        if(res.errorCode==0){
            result.origintext = res.query;
            result.resulttext = res.translation + '['+name+']';
        }else{
            result.origintext = origin;
            result.resulttext = JSON.stringify(res);
        }
        return result;
    }
    // const body = {
    //     q: query,
    //     appKey: appKey,
    //     salt: salt,
    //     from: from,
    //     to: to,
    //     sign: sign,
    //     signType: "v3",
    //     curtime: curtime
    // };
    // const request = net.request({
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     method: 'POST',
    //     url: apiurl
    // });

    // request.write(JSON.stringify(body));


    // request.on('response', response => {
    //     response.on('data', res => {
    //         let data = JSON.parse(res.toString())
    //         console.log(data);
    //     })
    //     response.on('end', () => {})
    // })
    
    // request.end();



}




exports.translate = translate;