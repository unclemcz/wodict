
//修改自腾讯示例代码
//https://console.cloud.tencent.com/api/explorer?Product=tmt&Version=2018-03-21&Action=TextTranslate



const https = require("https")
const crypto = require("crypto")

const host = "tmt.tencentcloudapi.com";



async function translate(query,engine) {
    const SECRET_ID = engine.appid;
    const SECRET_KEY = engine.key;
    const name = engine.name;
    let result = {};
    if (SECRET_ID == '' || SECRET_ID == null || SECRET_ID == undefined) {
        result.origintext = '请配置腾讯翻译SecretId';
        result.resulttext = '请配置腾讯翻译SecretId';
        return result;
    } else if(SECRET_KEY == '' || SECRET_KEY == null || SECRET_KEY == undefined) {
        result.origintext = '请配置腾讯翻译key';
        result.resulttext = '请配置腾讯翻译key';
        return result;
    }

    function sha256(message, secret = "", encoding) {
        const hmac = crypto.createHmac("sha256", secret)
        return hmac.update(message).digest(encoding)
    }
    function getHash(message, encoding = "hex") {
        const hash = crypto.createHash("sha256")
        return hash.update(message).digest(encoding)
    }
    function getDate(timestamp) {
        const date = new Date(timestamp * 1000)
        const year = date.getUTCFullYear()
        const month = ("0" + (date.getUTCMonth() + 1)).slice(-2)
        const day = ("0" + date.getUTCDate()).slice(-2)
        return `${year}-${month}-${day}`
    }
    const TOKEN = ""

    const service = "tmt"
    const region = "ap-shanghai"
    const action = "TextTranslate"
    const version = "2018-03-21"
    const timestamp = parseInt(String(new Date().getTime() / 1000))
    const date = getDate(timestamp)
    //const payload = "{}"
    const origin = query;//出错时，用于显示最原始的字符串
    query = query.replace(/[\r\n]/g, '');
    query = Buffer.from(query, 'utf8').toString('utf8');
    let payload = {
        "SourceText": query,
        "Source": "en",
        "Target": "zh",
        "ProjectId": 0
    };
    payload = JSON.stringify(payload);
    
    // ************* 步骤 1：拼接规范请求串 *************
    const signedHeaders = "content-type;host"
    const hashedRequestPayload = getHash(payload)
    const httpRequestMethod = "POST"
    const canonicalUri = "/"
    const canonicalQueryString = ""
    const canonicalHeaders = "content-type:application/json; charset=utf-8\n" + "host:" + host + "\n"
    
    const canonicalRequest = httpRequestMethod + "\n" + canonicalUri + "\n" + canonicalQueryString + "\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + hashedRequestPayload
    
    // ************* 步骤 2：拼接待签名字符串 *************
    const algorithm = "TC3-HMAC-SHA256"
    const hashedCanonicalRequest = getHash(canonicalRequest)
    const credentialScope = date + "/" + service + "/" + "tc3_request"
    const stringToSign = algorithm + "\n" +  timestamp + "\n" + credentialScope + "\n" + hashedCanonicalRequest
    
    // ************* 步骤 3：计算签名 *************
    const kDate = sha256(date, "TC3" + SECRET_KEY)
    const kService = sha256(service, kDate)
    const kSigning = sha256("tc3_request", kService)
    const signature = sha256(stringToSign, kSigning, "hex")
    
    // ************* 步骤 4：拼接 Authorization *************
    const authorization = algorithm + " " + "Credential=" + SECRET_ID + "/" + credentialScope +  ", " + "SignedHeaders=" + signedHeaders +  ", " + "Signature=" + signature
    
    // ************* 步骤 5：构造并发起请求 *************
    const headers = {
    Authorization: authorization,
    "Content-Type": "application/json; charset=utf-8",
    Host: host,
    "X-TC-Action": action,
    "X-TC-Timestamp": timestamp,
    "X-TC-Version": version,
    }
    
    if (region) {
        headers["X-TC-Region"] = region
    }
    if (TOKEN) {
        headers["X-TC-Token"] = TOKEN
    }
    
    const options = {
        hostname: host,
        method: httpRequestMethod,
        headers,
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = ""
            res.on("data", (chunk) => {
                data += chunk
            })
            
            res.on("end", () => {
                data = JSON.parse(data);
                //console.log(data);
                if (data.Response.Error == undefined) {
                    result.origintext = origin;
                    result.resulttext = data.Response.TargetText + '['+name+']';
                } else {
                    result.origintext = origin;
                    result.resulttext = JSON.stringify(data);
                }
                //console.log(result);
                resolve(result);
            })
        })
        req.on("error", (error) => {
            console.error(error)
        })
        req.write(payload)
        req.end()
    });
}

exports.translate = translate;