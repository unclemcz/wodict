const baidu = require('./baidu.js');
const youdao = require('./youdao.js');
const tencent = require('./tencent.js');
const alibase = require('./alibase.js');


async function translate(text,type,engine) {
    let result = {};
    if(type=="baidu"){
        result = await baidu.translate(text,engine);
    }else if(type=="youdao"){
        result = await youdao.translate(text,engine);
    }else if(type=="tencent"){
        result = await tencent.translate(text,engine);
    }else if(type=="alibase"){
        result = await alibase.translate(text,engine);
    }else{
        result = {"origintext":text,"resulttext":"当前选择的翻译引擎为["+type+"]，还未配置，请先配置翻译引擎参数。"};
    }
    return result;
}



exports.translate = translate;