const axios = require("axios");

const apiurl = 'https://api.moonshot.cn/';



async function translate(query,engine,win,controller) {
    //console.log(engine);
    let model = engine.model;
    const key = engine.key;
    const name = engine.name;
    let result = {};
    if (key == '' || key == null || key == undefined) {
        result.origintext = 'kimi的key未配置';
        result.resulttext = '请配置kimi的key。';
        win.webContents.send('update-text', result);
        return;
    }

    query = query.replace(/[\r\n]/g, ' ');


    //加一个提醒让用户等待
    win.webContents.send('update-text', {"origintext":query,"resulttext":"等待大模型["+name+"]翻译中......","done":false});
    const reqdata = {
        model: model,
        messages: [
          { role: "system", content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。Moonshot AI 为专有名词，不可翻译成其他语言。" },
          { role: "user", content: "你也是一位专业的翻译老师，请将3个#内的文本翻译成简体中文。###"+query+"###", }
        ],
        temperature: 0.3,
        stream:true
    };
    
    result.origintext = query;
    result.resulttext = '';
    
    axios.post(apiurl+'v1/chat/completions', reqdata, {responseType: 'stream',signal: controller.signal,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
        }
    })
    .then(response => {
        response.data.on('data', chunk => {
            chunk.toString().split('\n').forEach(line => {
                if (line.length > 0) {
                    line = line.slice(5);
                    if (!line.endsWith("[DONE]")) {
                        let data = JSON.parse(line);
                        if (data.choices[0].delta.content) {
                            result.resulttext += data.choices[0].delta.content;
                        }
                    }  
                }
            })
            result.done = false;
            console.log(result)
            win.webContents.send('update-text', result);
        });
        response.data.on('end', () => {
            // 完成解析
            result.done = true;
            result.resulttext += "["+name + ",模型:" + model+"]";  
            console.log(result)
            console.log('Stream ended');
            win.webContents.send('update-text', result);
        });
    })
    .catch(error => {
        //console.error('Error during request:', JSON.stringify(error));
        result = {"origintext":query,"resulttext":error.message,"done":true};
        win.webContents.send('update-text', result);
        console.log(JSON.stringify(error));
    });
}


async function modellist(engine) {
    const key = engine.key;
    let curmodel = engine.model;
    let result = [];

    try {
        let mlist = await axios.get(apiurl+'v1/models',{
            headers: {
              'Authorization': 'Bearer ' + key
            }
          });
        mlist = mlist.data.data;
        console.log(mlist);
        mlist.forEach(m => {
            if (m.id == curmodel) {
                result.unshift(m.id);
            } else {
                result.push(m.id);
            }
        });
    } catch (error) {
        console.error(error);
        //result = error;
    }
    return result;
}


exports.translate = translate;
exports.modellist = modellist;