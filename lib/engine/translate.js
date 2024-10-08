const baidu = require('./baidu.js');
const youdao = require('./youdao.js');
const tencent = require('./tencent.js');
const alibase = require('./alibase.js');
const volc = require('./volc.js');
const huawei = require('./huawei.js')
const ollama = require('./ollama.js');
const kimi = require('./kimi.js');


async function translate(text,type,engine,win,controller) {
    let result = {};
    if(type=="baidu"){
        result = await baidu.translate(text,engine);
        win.webContents.send('update-text', result);
    }else if(type=="youdao"){
        result = await youdao.translate(text,engine);
        win.webContents.send('update-text', result);
    }else if(type=="tencent"){
        result = await tencent.translate(text,engine);
        win.webContents.send('update-text', result);
    }else if(type=="alibase"){
        result = await alibase.translate(text,engine);
        win.webContents.send('update-text', result);
    }else if(type=="volc"){
        result = await volc.translate(text,engine);
        win.webContents.send('update-text', result);
    }else if(type=="huawei"){
        result = await huawei.translate(text,engine);
        win.webContents.send('update-text', result);
    }else if(type=="ollama"){
        result = {"origintext":text,"resulttext":"model-api-stream"};
        await ollama.translate(text,engine,win,controller);
    }else if(type=="kimi"){
        result = {"origintext":text,"resulttext":"model-api-stream"};
        await kimi.translate(text,engine,win,controller);
    }else{
        result = {"origintext":text,"resulttext":"translate.js无["+type+"]判断逻辑，请先增加判断分支。"};
        win.webContents.send('update-text', result);
    }
    return result;
}


async function modellist(type,engine,win) {
    let result = {};
    if (type=="ollama") {
        result = await ollama.modellist(engine);
    }else if (type=="kimi") {
        result = await kimi.modellist(engine);
    } else{
        result = [];
    }
    win.webContents.send('modellist', result);
    return result;
}


// async function translate(text,type,engine) {
//     let result = {};
//     if(type=="baidu"){
//         result = await baidu.translate(text,engine);
//     }else if(type=="youdao"){
//         result = await youdao.translate(text,engine);
//     }else if(type=="tencent"){
//         result = await tencent.translate(text,engine);
//     }else if(type=="alibase"){
//         result = await alibase.translate(text,engine);
//     }else if(type=="volc"){
//         result = await volc.translate(text,engine);
//     }else if(type=="huawei"){
//         result = await huawei.translate(text,engine);
//     }else{
//         result = {"origintext":text,"resulttext":"translate.js无["+type+"]判断逻辑，请先增加判断分支。"};
//     }
//     return result;
// }



exports.translate = translate;
exports.modellist = modellist;

