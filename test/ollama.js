
const ollama  = require("../lib/engine/ollama.js");
const  parse  = require('json-stream');

const engine = {
    "name":"ollama大模型工具",
    "url":"http://127.0.0.1:11434/",
    "model":"qwen"};




(async()=>{
    const eng = await ollama.modellist(engine);
    console.log(eng);
})();






