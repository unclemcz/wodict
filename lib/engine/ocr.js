const baiduocr = require('./baiduocr.js');
const wxocr = require('./wxocr.js');


async function ocr(text,type,engine) {
    let result = '';
    if(type=="baiduocr"){
        result = await baiduocr.ocr(text,engine);
    }else if(type=="wxocr"){
        result = await wxocr.ocr(text,engine);
    }
    else{
        result = "ocr.js无["+type+"]判断逻辑，请先增加判断分支。";
    }
    return result;
}

exports.ocr = ocr;

