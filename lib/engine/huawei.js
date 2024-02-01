//华为机器文本翻译

/**
 * 使用的华为SDK依赖以下包
 * npm install moment --save
 * npm install moment-timezone --save
 */

const endpoint = 'nlp-ext.cn-north-4.myhuaweicloud.com';
const projectid = '7253ab42f3b749708b99185082fd4ef2';
const apiurl = 'https://'+endpoint+'/v1/'+projectid+'/machine-translation/text-translation';

const signer = require('./huawei-sdk-2.0.6/signer');
const https = require("https");
let sig = new signer.Signer();


async function translate(text,engine) {
    // 设置安全凭证 AK、SK
    const AK = engine.appid;
    const SK = engine.key;
    const name = engine.name;

    sig.Key = AK;
    sig.Secret = SK;

    text = text.replace(/[\r\n]/g, '');
    text = Buffer.from(text, 'utf8').toString('utf8');

    let result = {};
    if (AK == '' || AK == null || AK == undefined) {
        result.origintext = '请配置华为翻译accessKeyId';
        result.resulttext = '请配置华为翻译accessKeyId';
        return result;
    } else if(SK == '' || SK == null || SK == undefined) {
        result.origintext = '请配置华为翻译Secret Access Key';
        result.resulttext = '请配置华为翻译Secret Access Key';
        return result;
    }

    let r = new signer.HttpRequest("POST", apiurl);
    r.headers = {"Content-Type": "application/json"};
    r.body = JSON.stringify({"text": text,"from": "auto","to": "zh"});

    let opt = sig.Sign(r);
    //console.log(opt.headers["X-Sdk-Date"]);
    //console.log(opt.headers["Authorization"]);
    
    return new Promise((resolve, reject) => {
        let req = https.request(opt, function (res) {
            let data = ""
            res.on("data", function (chunk) {
                //console.log(chunk.toString())
                data += chunk
            })
            res.on("end", () => {
                data = JSON.parse(data);
                //console.log(data);
                if (!data.error_code) {
                    result.origintext = data.src_text;
                    result.resulttext = data.translated_text + '['+name+']';
                } else {
                    result.origintext = text;
                    result.resulttext = JSON.stringify(data);
                }
                //console.log(result);
                resolve(result);
            })
        });
        
        req.on("error", function (err) {
            console.log(err.message)
        });
        req.write(r.body);
        req.end();
    });
}







exports.translate = translate;