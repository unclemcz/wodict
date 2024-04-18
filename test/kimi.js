
const kimi  = require("../lib/engine/kimi.js");
const  parse  = require('json-stream');

const engine = {
    "name":"Kimi大模型",
    "key":"sk-Zw129EciC1EbggVxge4iJsfhNGYRBqQpG9H3ZYDWNEsjeJYv",
    "model":"moonshot-v1-8k"
};




(async()=>{
    await kimi.translate("Coppola grew up watching Francis do battle with movie studios. The success of the “Godfather” films hardly assured him funding equal to his ambitions, and he often went to harrowing lengths to get his projects made independently, driving himself to the brink of bankruptcy or nervous breakdown. ",engine,"win","controller");
})();




// (async()=>{
//     const eng = await kimi.modellist(engine);
//     console.log(eng);
// })();

