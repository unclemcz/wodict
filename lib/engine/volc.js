//字节跳动火山机器文本翻译调用函数依赖第三方SDK，需要安装SDK包

// import VolcEngineSDK from "volcengine-sdk";
const VolcEngineSDK = require("volcengine-sdk");
const axios = require("axios");
//
const { ApiInfo, ServiceInfo, Credentials, API, Request } = VolcEngineSDK;


const apiurl = 'translate.volcengineapi.com';
const regionid = 'cn-north-1';


async function translate(text,engine) {
    // 设置安全凭证 AK、SK
    const AK = engine.appid;
    const SK = engine.key;
    const name = engine.name;

    text = text.replace(/[\r\n]/g, '');
    text = Buffer.from(text, 'utf8').toString('utf8');

    let result = {};
    if (AK == '' || AK == null || AK == undefined) {
        result.origintext = '请配置火山翻译accessKeyId';
        result.resulttext = '请配置火山翻译accessKeyId';
        return result;
    } else if(SK == '' || SK == null || SK == undefined) {
        result.origintext = '请配置火山翻译Secret Access Key';
        result.resulttext = '请配置火山翻译Secret Access Key';
        return result;
    }

    // api凭证
    const credentials = new Credentials(AK, SK, 'translate', regionid);
    // 设置请求的 header、query、body
    const header = new Request.Header({
        'Content-Type': 'application/json'
    });
    const query = new Request.Query({
        'Action': 'TranslateText',
        'Version': '2020-06-01'
    });
    const body = new Request.Body({
        'TargetLanguage': 'zh',
        'TextList': [text]
    });

    // 设置 service、api信息
    const serviceInfo = new ServiceInfo(
        apiurl,
        header,
        credentials
    );
    const apiInfo = new ApiInfo('POST', '/', query, body);


    // 生成 API
    const api = API(serviceInfo, apiInfo);
    //console.log(api.url, api.params, api.config);

    // 获取 API 数据，发送请求
    let res = await axios.post(api.url, api.params, api.config);
    res = res.data;
    console.log(res);

    if(!res.ResponseMetadata.Error){
        result.origintext = text;
        result.resulttext = res.TranslationList[0].Translation + '['+name+']';
    }else{
        result.origintext = text;
        result.resulttext = JSON.stringify(res);
    }
    return result;
}






exports.translate = translate;