
const ollama  = require("../lib/engine/ollama.js");
const  parse  = require('json-stream');

const engine = {
    "name":"ollama大模型工具",
    "url":"http://127.0.0.1:11434/",
    "model":"qwen"};


    ollama.translate("Eddy has a back porch, but he never sits out there. Eddy is a guy you live with? No, just a friend. ",engine)
    // .then(stream=>{
    //     // 处理返回的流
    //     const parser = parse();
    //     stream.on('data', chunk => {
    //         // 处理每个数据块
    //         //console.log(chunk);
    //         parser.write(chunk.toString());
    //     });
    //     stream.on('end', () => {
    //         //console.log('Stream ended');
    //         parser.end();
    //     });
    //     stream.on('error', error => {
    //         console.error('Error with stream', error);
    //     });
    //     parser.on('data', data => {
    //     // 处理每个解析后的 JSON 对象
    //         console.log(data);
    //     });
    //         parser.on('error', error => {
    //     console.error('Error parsing JSON', error);
    //     });
    // })
    // .catch(err=>{
    //     console.error('Error during request:', err);
    // });




