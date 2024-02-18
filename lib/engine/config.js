//配置参数

const { app} = require('electron')

const fs = require('fs-extra')
const path = require('node:path')

let cfg_file = path.join(app.getPath("userData"), 'config.json');

let cfg ={
    "notification":false,
    "autotranslate":true,
    "wininto":false,
    "curengine":"baidu",
    "baidu":{
        "name":"百度通用文本翻译",
        "appid":"",
        "key":""
    },
    "youdao":{
        "name":"网易有道文本翻译",
        "appid":"",
        "key":""
    },
    "tencent":{
        "name":"腾讯机器文本翻译",
        "appid":"",
        "key":""
    },
    "alibase":{
        "name":"阿里机器文本翻译",
        "appid":"",
        "key":""
    },
    "volc":{
        "name":"火山机器文本翻译",
        "appid":"",
        "key":""
    },
    "huawei":{
        "name":"华为机器文本翻译",
        "appid":"",
        "key":""
    }
}


function cfginit() {
    console.log("userData:",app.getPath("userData"));
    const exists = fs.pathExistsSync(cfg_file);
    console.log('判断',cfg_file,'是否存在:',exists);
    if (!exists) {
        console.log('开始重置config.json');
        try {
            fs.writeJsonSync(cfg_file, cfg);
            console.log('重置config.json成功');
        } catch (error) {
            console.error(error)
        }

    }
}


function cfgsave(cfg_t) {
    console.log('开始保存config.json');
    try {
        fs.writeJsonSync(cfg_file, cfg_t);
        console.log('保存config.json成功');
    } catch (error) {
        console.error(error)
    }
}

function cfgread() {
    cfginit();
    try {
        console.log('开始读取',cfg_file);
        const cfg_t = fs.readJsonSync(cfg_file)
        //console.log(JSON.stringify(cfg_t));
        return cfg_t;
    } catch (error) {
        console.error(error)
    }
}


exports.cfgsave = cfgsave;
exports.cfgread = cfgread;