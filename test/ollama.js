
const ollama  = require("../lib/engine/ollama.js");
const  parse  = require('json-stream');
const axios = require('axios');


const engine = {
    "name":"ollama大模型工具",
    "url":"http://127.0.0.1:11434/",
    "model":"qwen"};




// (async()=>{
//     const eng = await ollama.modellist(engine);
//     console.log(eng);
// })();


//输出当前时间
console.log(new Date().toString());

axios.post('http://localhost:11434/api/generate',
    {model:"qwen2:1.5b",
    prompt:"Translate the following text from English to Simplified Chinese:\n\nhello world",
    stream:false})
    .then(res=>{
        console.log(res.data);
        //输出当前时间
        console.log(new Date().toString());
    }).catch(err=>{
        console.log(err);
})




