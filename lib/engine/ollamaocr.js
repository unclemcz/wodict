const { Ollama } = require("ollama")
const apiurl = 'http://127.0.0.1:11434/';

async function ocr(imgbase64,engine,win) {
    win.webContents.send('update-origin-text', {"origintext":"等待大模型["+engine.model+"]识别中......","done":false});
    //将imgbase64开头的"data:image/png;base64,"去除
    imgbase64 = imgbase64.replace("data:image/png;base64,", "");
    let ollamaurl = engine?.url  || apiurl;
    let ollamamodel = engine?.model;
    console.log(ollamaurl,ollamamodel);
    let ollama = new Ollama({
        host:ollamaurl
    });
    console.log('ollamaocr开始执行');
    const response = await ollama.chat({
        model: ollamamodel,
        messages: [
            {
                "role": "user",
                "content": "OCR <image>",
                "images": [imgbase64]
            }
        ],
        stream:true,
        think:false,
    })
    let result = {};
    result.origintext = '';
    for await (const part of response) {
        result.origintext += part.message.content;
        result.done = part.done;
        win.webContents.send('update-origin-text',result);
        if(result.done==true){
            console.log(result.origintext)
            win.webContents.send('write-to-clipboard', result.origintext);
        }
    }
}

exports.ocr = ocr;
