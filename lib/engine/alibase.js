//阿里机器文本翻译调用函数依赖阿里SDK，需要安装SDK包
//npm install --save @alicloud/alimt20181012
//

const ALIMT = require('@alicloud/alimt20181012');  



const apiurl = 'mt.cn-hangzhou.aliyuncs.com';
const regionid = "cn-hangzhou";


async function translate(query,engine) {
    const appid = engine.appid;
    const key = engine.key;
    const name = engine.name;

    const client = new ALIMT.default({
        endpoint: apiurl,
        accessKeyId: appid,
        accessKeySecret: key,
        type: "access_key",
        regionId: regionid
    });
    
    let result = {};
    if (appid == '' || appid == null || appid == undefined) {
        result.origintext = '请配置阿里翻译accessKeyId';
        result.resulttext = '请配置阿里翻译accessKeyId';
        return result;
    } else if(key == '' || key == null || key == undefined) {
        result.origintext = '请配置阿里翻译accessKeySecret';
        result.resulttext = '请配置阿里翻译accessKeySecret';
        return result;
    }
    query = query.replace(/[\r\n]/g, '');
    query = Buffer.from(query, 'utf8').toString('utf8');

    let payload = {
        formatType: "text",
        sourceLanguage: "en",
        targetLanguage: "zh",
        sourceText: query,
        scene: "general",
        FormatType:"text"
    };

    let res = await client.translateGeneral(payload);  
    res = res.body;
    //console.log(res);
    if(res.code==200){
        result.origintext = query;
        result.resulttext = res.data.translated + '['+name+']';
    }else{
        result.origintext = query;
        result.resulttext = JSON.stringify(res);
    }
    return result;
}





exports.translate = translate;