const axios = require("axios");
const parse  = require('json-stream');
const utils = require('../utils.js');

const apiurl = 'http://127.0.0.1:11434/';



async function translate(query,engine,win,controller) {
    //console.log(engine);
    let appid = engine.url;
    const key = engine.model;
    const name = engine.name;
    let result = {};
    if (key == '' || key == null || key == undefined) {
        result.origintext = 'ollama的模型未配置';
        result.resulttext = '请配置ollama的模型';
        win.webContents.send('update-text', result);
        return;
    }
    let origin = query;//出错时，用于显示最原始的字符串
    query = query.replace(/[\r\n]/g, '');
    query = Buffer.from(query, 'utf8').toString('utf8');
    //query = "请将以下文字翻译为中文："+query;

    if (!utils.isUrl(appid)) {
        appid = apiurl
    }

    //console.log(appid,key);
    //大模型反应较慢，先加一个提醒让用户等待
    win.webContents.send('update-text', {"origintext":origin,"resulttext":"等待大模型["+key+"]翻译中......","done":false});
    const reqdata = {
        "model": key,
        "prompt": "你是一位专业的翻译老师，请将给定的这段文本翻译成简体中文。###"+query+"###",
        //"stream": false
    }
    
    result.origintext = origin;
    result.resulttext = '';

    // const res = await axios.post(apiurl+'api/generate', reqdata, {responseType: 'stream'})
    // return res.data;
    
    axios.post(appid+'api/generate', reqdata, {responseType: 'stream',signal: controller.signal})
        .then(response => {
            // 使用 json-stream 库来解析流式 JSON
            const parser = parse();
            let i = 0;
            response.data.on('data', chunk => {
                // 将数据块传递给解析器
                parser.write(chunk.toString());
            });
            response.data.on('end', () => {
                // 完成解析
                parser.end();
                console.log('Stream ended');
            });
            parser.on('data', data => {
                //处理每个解析后的 JSON 对象
                if (!data.done) {
                    result.resulttext += data.response;  
                    result.done = false;
                } else {
                    result.resulttext += "["+name + ",模型:" + data.model+"]";  
                    result.done = true;
                }
                win.webContents.send('update-text', result);
                //console.log(result);
            });
            parser.on('error', error => {
                console.error('Error parsing JSON', error);
            });
        })
        .catch(error => {
            //console.error('Error during request:', JSON.stringify(error));
            result = {"origintext":origin,"resulttext":error.address+':'+error.port+' '+ error.syscall + ' ' + error.code,"done":true};
            win.webContents.send('update-text', result);
            console.log(result);
        });
}



async function modellist(engine) {
    let appid = engine.url;
    let curmodel = engine.model;
    let result = [];

    if (!utils.isUrl(appid)) {
        appid = apiurl
    }
    try {
        let mlist = await axios.get(appid+'api/tags');
        mlist = mlist.data.models;
        //console.log(mlist);
        mlist.forEach(m => {
            if (m.model == curmodel) {
                result.unshift(m.model);
            } else {
                result.push(m.model);
            }
        });
    } catch (error) {
        console.error(error);
    }
    return result;
}


exports.translate = translate;
exports.modellist = modellist;